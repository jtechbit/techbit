<script lang="ts">
    import { boldFirstTwoLetters } from "source/content-script/boldFirstTwoLetters";
    import Icon from "../Icon.svelte";

    function handleClick() {
        console.log("Boldify button clicked");
        boldFirstTwoLetters();
    }
</script>

<div class="lindy-bugreport-button" on:click={handleClick}>
    <Icon iconName="text-bold" />
    <div>Boldify Text</div>
</div>

<style global lang="postcss">
    .lindy-bugreport-button {
        padding: 2px 8px !important;
        display: flex !important;
        align-items: center !important;
        width: auto !important;

        font-size: 13px !important;
        font-weight: 600 !important;
        color: var(--text-color) !important;

        cursor: pointer !important;
        border: none !important;
        border-radius: 5px !important;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
        background-color: #f3f4f6 !important;
        user-select: none !important;

        transform: scale(100%) !important;
        filter: brightness(100%) !important;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    .lindy-bugreport-button > .lindy-ui-icon {
        color: var(--text-color) !important;
        width: 1em !important;
        margin-right: 3px !important;
    }

    .lindy-bugreport-button:hover {
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
        filter: brightness(95%) !important;
    }
</style>
