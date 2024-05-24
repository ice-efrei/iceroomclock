"use client";

import {HomeAssistantProvider} from "@/context/homeassistant";

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <HomeAssistantProvider>
            {children}
        </HomeAssistantProvider>
    );
}