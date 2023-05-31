import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/ui";
import Head from "next/head";
import { useRouter } from "next/router";
import posthog from "posthog-js";
import { useEffect } from "react";

import { LindyIcon } from "@unclutter/library-components/dist/components";

export default function LoginPage({ isSignup = false }) {
    const router = useRouter();
    const { user, error } = useUser();

    useEffect(() => {
        // on login success
        if (user) {
            posthog.identify(user.id, { email: user.email });
            router.push("/");
        }
    }, [user]);

    const origin = typeof window !== "undefined" ? window.location.origin : "";

    return (
        // dark:bg-[#212121] dark:text-[rgb(232,230,227)]
        <div className="min-h-screen text-stone-800 lg:grid lg:grid-cols-2">
            <Head>
                <title>Unclutter Library</title>
            </Head>

            <aside className="flex flex-col items-center gap-5 bg-stone-50 p-5 lg:pt-32">
                <div className="font-title flex items-center justify-center gap-3 text-3xl font-semibold dark:text-stone-800 md:text-4xl">
                    <LindyIcon className="w-10" />
                    <h1>Unclutter Library</h1>
                </div>

                <p className="max-w-md text-center">
                    Get more value out of reading by automatically saving, organizing, and
                    connecting related article quotes.
                </p>

                <img
                    className="mt-5 hidden w-full max-w-2xl rounded-lg md:block"
                    src="/media/connect_ideas.png"
                />
            </aside>

            <main className="flex w-full flex-col bg-white p-4 py-10 lg:pt-32">
                <div className="mx-auto w-full max-w-md">
                    {error && <p>{error.message}</p>}

                    <Auth
                        supabaseClient={supabaseClient}
                        providers={["google", "github"]}
                        socialLayout="horizontal"
                        socialButtonSize="large"
                        redirectTo={origin}
                        view={isSignup ? "sign_up" : "sign_in"}
                    />
                </div>
            </main>
        </div>
    );
}
