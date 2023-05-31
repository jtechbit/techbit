import type { Annotation, UserInfo } from "@unclutter/library-components/dist/store";
import browser from "../common/polyfill";
import { rep } from "./library/library";
import { saveAIAnnotations, getRelatedAnnotationsCount } from "./library/smartHighlights";

export class TabStateManager {
    private userInfo: UserInfo;
    private tabReaderModeActive: { [tabId: number]: boolean } = {};
    private tabAnnotations: { [tabId: string]: Annotation[] } = {};
    private unsavedAnnotations: { [tabId: string]: boolean } = {};
    private relatedAnnotationsCount: { [tabId: string]: number } = {};

    onChangeActiveTab(tabId?: number) {
        if (tabId === undefined) {
            return;
        }
        this.renderBadgeCount(tabId);
    }

    onCloseTab(tabId?: number) {
        if (tabId === undefined) {
            return;
        }

        // release storage
        delete this.tabReaderModeActive[tabId];
        delete this.tabAnnotations[tabId];
        delete this.relatedAnnotationsCount[tabId];

        // clear badge
        this.renderBadgeCount(tabId);
    }

    // check saved annotations for a given url (without any network requests), to
    // determine if the user previously used the extension on this page
    async checkHasLocalAnnotations(tabId?: number, articleId?: string) {
        if (tabId === undefined || !articleId || !(await this.checkAIEnabled())) {
            return;
        }

        // clear immediately after navigation
        this.onCloseTab(tabId);

        this.tabAnnotations[tabId] = await rep.query.listArticleAnnotations(articleId);
        this.relatedAnnotationsCount[tabId] = await getRelatedAnnotationsCount(
            this.userInfo,
            this.tabAnnotations[tabId]
        );
        this.renderBadgeCount(tabId);

        return !!this.tabAnnotations[tabId]?.length;
    }

    hasAIAnnotations(tabId?: number) {
        if (tabId === undefined) {
            return;
        }

        const aiAnnotations = this.tabAnnotations[tabId]?.filter((a) => a.ai_created) || [];
        return !!aiAnnotations?.length;
    }

    async setParsedAnnotations(tabId: number, annotations: Annotation[]) {
        if (tabId === undefined || !(await this.checkAIEnabled())) {
            return;
        }

        // highlights.ts may be injected by reader mode itself, so immediately save annotations once available
        if (this.tabReaderModeActive[tabId]) {
            saveAIAnnotations(this.userInfo, annotations);
            this.unsavedAnnotations[tabId] = false;
        } else {
            this.unsavedAnnotations[tabId] = true;
        }

        this.tabAnnotations[tabId] = annotations;
        this.relatedAnnotationsCount[tabId] = await getRelatedAnnotationsCount(
            this.userInfo,
            annotations
        );

        this.renderBadgeCount(tabId);
    }

    async onActivateReaderMode(tabId?: number) {
        if (tabId === undefined) {
            return;
        }

        this.tabReaderModeActive[tabId] = true;

        const annotations = this.tabAnnotations[tabId];
        if (this.unsavedAnnotations[tabId] && annotations?.length) {
            await saveAIAnnotations(this.userInfo, annotations);
            this.unsavedAnnotations[tabId] = false;
        }
    }

    private async renderBadgeCount(tabId?: number) {
        if (tabId === undefined) {
            return;
        }

        const badgeCount = this.relatedAnnotationsCount[tabId];
        // const badgeCount = this.tabAnnotations[tabId]?.length;

        const text = badgeCount ? badgeCount.toString() : "";

        browser.action.setBadgeBackgroundColor({ color: "#facc15" });
        browser.action.setBadgeText({ text });
    }

    // update enabled status on every reader mode call
    // TODO cache this? but how to show counts once enabled?
    private async checkAIEnabled() {
        this.userInfo = await rep?.query.getUserInfo();
        return this.userInfo?.aiEnabled;
    }
}

export const tabsManager = new TabStateManager();
