"use client";
import {createContext, useState, useEffect, useContext, ReactNode} from 'react';
import {HomeAssistant} from "@/utils/homeassistant";

// Create the context
const HomeAssistantContext = createContext<HomeAssistant | null>(null);

// Create the provider component
export const HomeAssistantProvider = ({ children }: { children: ReactNode }) => {
    const [homeAssistant, setHomeAssistant] = useState<HomeAssistant | null>(new HomeAssistant());
    
    // useEffect(() => {
    //     const ha = new HomeAssistant();
    //     setHomeAssistant(ha);
    //     return () => {
    //         // Clean up code here if needed
    //     };
    // }, []);
    
    return (
        <HomeAssistantContext.Provider value={homeAssistant}>
            {children}
            </HomeAssistantContext.Provider>
    );
};

// Create a custom hook for accessing the context
export const useHomeAssistant = () => {
    const context = useContext(HomeAssistantContext);
    // if (context === null) {
    //     throw new Error('useHomeAssistant must be used within a HomeAssistantProvider');
    // }
    return context;
};