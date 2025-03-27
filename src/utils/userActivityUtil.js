import { useState, useEffect, useRef } from 'react';
import _ from 'lodash';

const useUserActivity = (user, onUserActive) => {
    const [isActive, setIsActive] = useState(false);
    const timeoutRef = useRef(null); // Use ref to store timeout ID
    const lastUpdateTime = useRef(null);
    const inactiveTimeout = 60000 * 2; // 2min of inactivity
    const activeDelay = 60000 * 5; // 5min delay
    const wasRecentlyInactive = useRef(false);

    useEffect(() => {
        const resetActivity = () => {
            const difference = Date.now() - lastUpdateTime.current;

            // Log user active every 5min or when user becomes active again after being inactive
            if (!_.isEmpty(user) &&
                (difference >= activeDelay || (!isActive && !wasRecentlyInactive.current))
            ) {
                lastUpdateTime.current = Date.now();
                setIsActive(true);
                onUserActive(true);
                wasRecentlyInactive.current = false; // allow future reactivations
            }

            // Clear the existing timeout to avoid memory leaks
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                if (!_.isEmpty(user) && isActive) {
                    lastUpdateTime.current = Date.now();
                    setIsActive(false);
                    onUserActive(false);
                    wasRecentlyInactive.current = true; // prevent instant reactivation
                }
            }, inactiveTimeout);
        };

        const userInteractionHandler = () => {
            wasRecentlyInactive.current = false; // Ensures real user actions reset the flag
            resetActivity();
        };

        window.addEventListener('mousemove', userInteractionHandler);
        window.addEventListener('keydown', userInteractionHandler);
        window.addEventListener('scroll', userInteractionHandler);

        resetActivity();

        return () => {
            // Cleanup: Remove event listeners & clear timeout
            window.removeEventListener('mousemove', userInteractionHandler);
            window.removeEventListener('keydown', userInteractionHandler);
            window.removeEventListener('scroll', userInteractionHandler);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [user, isActive]);

    return isActive;
};

export default useUserActivity;