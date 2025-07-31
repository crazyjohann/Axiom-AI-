// app.jsx
// This is the main application component that consolidates all other components
// (LoginPage, LandingPage, Chat, ImageGenerator, CodePlayground, CreativeCanvas, DeepResearch)
// into a single file to avoid import resolution issues in certain environments.

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth, signInAnonymously, signInWithCustomToken, signOut,
    onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
    // createUserWithEmailAndPassword, signInWithEmailAndPassword // Keep these imported for potential future full implementation
} from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';

// ====================================================================================================
// START: SVG Icons (Defined once for all components)
// These icons are defined as components to be easily reusable and styled.
// ====================================================================================================
function ArrowLeftIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
    );
}
function PlusIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
    );
}
function SendIcon({ className = "w-6 h-6 transform rotate-45 -translate-y-px" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
    );
}
function SearchIcon({ className = "w-6 h-6" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    );
}
// CrownIcon for Upgrade button
function CrownIcon({ className = "w-6 h-6" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 10c0-1.1-.9-2-2-2h-2V5c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3H7c-1.1 0-2 .9-2 2v2h14v-2zM5 14v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2H5z"/>
        </svg>
    );
}
function ChatIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
    );
}
function SettingsIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    );
}
function ImageOutlineIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    );
}
function CodeIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
    );
}
function CanvasIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM14 10l-2 2m0 0l-2 2m2-2l2 2m-2-2l-2-2"></path>
        </svg>
    );
}
function LogoutIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
    );
}
function MenuExpandIcon({ className = "w-6 h-6" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
    );
}
function MenuCollapseIcon({ className = "w-6 h-6" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
    );
}
function DeepResearchIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"></path></svg>
    );
}
function MicIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.2-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
    );
}
function UserIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
    );
}
// ====================================================================================================
// END: SVG Icons
// ====================================================================================================

// ====================================================================================================
// START: Global Context for User Limits
// This context will manage and provide access to feature limits for guest users.
// ====================================================================================================
const UserLimitContext = createContext(null);

function UserLimitProvider({ children, isGuest, currentPlan }) {
    // Define initial limits for guest users
    const guestLimits = {
        imageGenerations: 5,
        codeGenerations: 5,
        canvasGenerations: 5,
        deepResearchQueries: 5,
        chatMessages: 20,
    };

    // Define limits for different registered plans
    const planLimits = {
        'Basic': {
            imageGenerations: 10,
            codeGenerations: 10,
            canvasGenerations: 10,
            deepResearchQueries: 10,
            chatMessages: 50,
        },
        'Pro': {
            imageGenerations: 25,
            codeGenerations: 25,
            canvasGenerations: 25,
            deepResearchQueries: 25,
            chatMessages: 100,
        },
        'Ultimate': {
            imageGenerations: Infinity,
            codeGenerations: Infinity,
            canvasGenerations: Infinity,
            deepResearchQueries: Infinity,
            chatMessages: Infinity,
        }
    };

    // State to track remaining limits
    const [limits, setLimits] = useState(isGuest ? guestLimits : planLimits[currentPlan] || planLimits['Basic']);

    // Function to decrement a limit
    const decrementLimit = (feature) => {
        if (limits[feature] === Infinity) {
            return true; // Unlimited, so no decrement needed
        }
        if (limits[feature] > 0) {
            setLimits(prevLimits => ({
                ...prevLimits,
                [feature]: prevLimits[feature] - 1
            }));
            return true; // Limit decremented successfully
        }
        return false; // Limit reached
    };

    // Update limits when user status (guest/registered) or plan changes
    useEffect(() => {
        if (isGuest) {
            setLimits(guestLimits);
        } else {
            setLimits(planLimits[currentPlan] || planLimits['Basic']);
        }
    }, [isGuest, currentPlan]);

    return (
        <UserLimitContext.Provider value={{ limits, decrementLimit, isGuest, currentPlan }}>
            {children}
        </UserLimitContext.Provider>
    );
}
// ====================================================================================================
// END: Global Context for User Limits
// ====================================================================================================


// ====================================================================================================
// START: MessageModal Component
// A simple modal to display messages instead of disruptive alert().
// ====================================================================================================
function MessageModal({ message, onClose }) {
    if (!message) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-center border border-gray-700">
                <p className="text-lg text-gray-100 mb-4">{message}</p>
                <button
                    onClick={onClose}
                    className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition-colors"
                >
                    OK
                </button>
            </div>
        </div>
    );
}
// ====================================================================================================
// END: MessageModal Component
// ====================================================================================================

// ====================================================================================================
// START: UpgradeModal Component
// Displays information about plans and encourages registration/sign-in.
// ====================================================================================================
function UpgradeModal({ onClose, onSignInClick, isGuest }) {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full text-gray-100">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Unlock Full StellarMind AI Power!</h2>
                <p className="text-lg text-gray-300 mb-6 text-center">
                    {isGuest ?
                        "As a guest, you have limited access. Register or Sign In to enjoy unlimited capabilities and select your preferred plan!" :
                        "Select a plan to unlock more features and higher limits!"
                    }
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Basic Plan */}
                    <div className="bg-gray-700 p-5 rounded-lg border border-gray-600 flex flex-col">
                        <h3 className="text-xl font-bold text-purple-400 mb-3">StellarMind Basic</h3>
                        <p className="text-gray-300 text-sm mb-4">Standard features for everyday use.</p>
                        <ul className="text-gray-400 text-sm space-y-2 flex-grow">
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> AI Chat (50 messages)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Image Generation (10/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Code Assistance (10/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Creative Canvas (10/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Deep Research (10/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Community Support</li>
                        </ul>
                        <div className="text-center mt-4">
                            <span className="text-3xl font-extrabold text-white">Free</span>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className={`bg-gray-700 p-5 rounded-lg border-2 border-purple-600 flex flex-col ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <h3 className="text-xl font-bold text-purple-500 mb-3">StellarMind Pro</h3>
                        <p className="text-gray-300 text-sm mb-4">Advanced tools for creative professionals.</p>
                        <ul className="text-gray-400 text-sm space-y-2 flex-grow">
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> AI Chat (100 messages)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Image Generation (25/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Code Assistance (25/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Creative Canvas (25/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Deep Research (25/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Priority Support</li>
                        </ul>
                        <div className="text-center mt-4">
                            <span className="text-3xl font-extrabold text-white">Free</span>
                        </div>
                        {isGuest && <p className="text-red-300 text-xs text-center mt-2">Sign in to unlock!</p>}
                    </div>

                    {/* Ultimate Plan */}
                    <div className={`bg-gray-700 p-5 rounded-lg border border-gray-600 flex flex-col ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <h3 className="text-xl font-bold text-purple-400 mb-3">StellarMind Ultimate</h3>
                        <p className="text-gray-300 text-sm mb-4">The full suite for ultimate productivity.</p>
                        <ul className="text-gray-400 text-sm space-y-2 flex-grow">
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> AI Chat (Unlimited)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Image Generation (Unlimited)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Code Assistance (Unlimited)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Creative Canvas (Unlimited)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Deep Research (Unlimited)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> API Access</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> 24/7 Premium Support</li>
                        </ul>
                        <div className="text-center mt-4">
                            <span className="text-3xl font-extrabold text-white">Free</span>
                        </div>
                        {isGuest && <p className="text-red-300 text-xs text-center mt-2">Sign in to unlock!</p>}
                    </div>
                </div>

                {isGuest && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={onSignInClick}
                            className="py-3 px-6 bg-purple-600 hover:bg-purple-700 rounded-full text-white text-lg font-semibold transition-colors shadow-md"
                        >
                            Sign In / Register Now!
                        </button>
                    </div>
                )}

                {/* Close button added here */}
                <div className="text-center mt-6">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
// ====================================================================================================
// END: UpgradeModal Component
// ====================================================================================================

// ====================================================================================================
// START: TwoFactorAuthModal Component (Simulated 2FA)
// This component simulates a 2FA prompt.
// ====================================================================================================
function TwoFactorAuthModal({ onVerify, onClose }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (code === '123456') { // Simple mock code
            onVerify();
        } else {
            setError('Invalid code. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-gray-100 text-center">
                <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
                <p className="mb-6 text-gray-300">
                    Please enter the 6-digit code sent to your simulated device.
                    (Hint: Use "123456" for demonstration)
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        maxLength="6"
                        className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="••••••"
                        required
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors shadow-md"
                    >
                        Verify Code
                    </button>
                </form>
                <button
                    onClick={onClose}
                    className="mt-4 text-gray-400 hover:text-white transition-colors text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
// ====================================================================================================
// END: TwoFactorAuthModal Component
// ====================================================================================================


// ====================================================================================================
// START: ProfileDropdown Component
// This component handles the profile icon with a dropdown menu for user ID and sign out.
// ====================================================================================================
function ProfileDropdown({ onSignOut, userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Profile menu"
            >
                <UserIcon className="w-6 h-6" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                    {userId && (
                        <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700 truncate" title={userId}>
                            User ID: <span className="font-mono text-xs">{userId.substring(0, 8)}...</span>
                        </div>
                    )}
                    <button
                        onClick={onSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
// ====================================================================================================
// END: ProfileDropdown Component
// ====================================================================================================

// ====================================================================================================
// START: PlanDropdown Component
// This component allows users to select different AI plans (Basic, Pro, Ultimate).
// ====================================================================================================
function PlanDropdown({ currentPlan, onSelectPlan, className = "", isGuest }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const plans = ['Basic', 'Pro', 'Ultimate'];

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center py-2 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                disabled={isGuest} // Disable dropdown for guests
            >
                {currentPlan}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && !isGuest && ( // Only show dropdown if not a guest
                <div className="absolute left-0 mt-2 w-32 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                    {plans.map((plan) => (
                        <button
                            key={plan}
                            onClick={() => {
                                onSelectPlan(plan);
                                setIsOpen(false);
                                console.log(`Plan changed to: ${plan}`); // Log plan change
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            {plan}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
// ====================================================================================================
// END: PlanDropdown Component
// ====================================================================================================

// ====================================================================================================
// START: Sidebar Component (Extracted for reusability)
// This component renders the left-hand sidebar navigation.
// ====================================================================================================
function Sidebar({ isMenuExpanded, setIsMenuExpanded, onNavigate, currentView, onSignOut, auth, handleNewChat }) {
    return (
        <aside
            className={`bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${
                isMenuExpanded ? 'w-64' : 'w-20'
            } flex-shrink-0`}
        >
            {/* StellarMind Header */}
            <div className={`flex items-center p-4 ${isMenuExpanded ? 'justify-between' : 'justify-center'}`}>
                <div className={`flex items-center ${isMenuExpanded ? '' : 'hidden'}`}>
                    {/* Logo: Brain icon with pink and white combo */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                         style={{
                             background: 'linear-gradient(to right bottom, #FF69B4, #FFD1DC)',
                             boxShadow: '0 0 8px rgba(255, 105, 180, 0.5)',
                             border: '1px solid rgba(255, 255, 255, 0.3)'
                         }}
                    >
                        <span role="img" aria-label="brain emoji" style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))' }}>🧠</span>
                    </div>
                    <span className="text-xl font-semibold"
                          style={{
                              background: 'linear-gradient(to right, #8A2BE2, #4169E1)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              color: 'transparent'
                          }}>StellarMind</span>
                </div>
                <button
                    onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                    className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                    aria-label={isMenuExpanded ? "Collapse menu" : "Expand menu"}
                >
                    {isMenuExpanded ? <MenuCollapseIcon /> : <MenuExpandIcon />}
                </button>
            </div>

            {/* New Chat Button (replaces "Keep menu expanded" toggle) */}
            <div className={`p-4 ${isMenuExpanded ? 'justify-between' : 'justify-center'} border-b border-gray-700 pb-4`}>
                <button
                    onClick={handleNewChat}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                    <PlusIcon className="w-6 h-6 mr-2" /> {/* Increased size of PlusIcon */}
                    {isMenuExpanded && 'New Chat'}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-grow px-4 overflow-y-auto">
                {/* Added mt-4 for space above "RECENT" */}
                <div className="mt-4"> {/* This div adds the desired space */}
                    <h3 className={`text-xs font-semibold text-gray-500 uppercase mb-2 ${isMenuExpanded ? '' : 'text-center'}`}>
                        {isMenuExpanded ? 'RECENT' : 'REC'}
                    </h3>
                </div>
                <ul>
                    {/* Removed Chat button from here as requested */}
                    {/* You can add dynamic recent chats here if needed */}
                </ul>
            </nav>

            {/* Feature Buttons */}
            <div className="px-4 py-2 border-t border-gray-700">
                <h3 className={`text-xs font-semibold text-gray-500 uppercase mb-2 ${isMenuExpanded ? '' : 'text-center'}`}>
                    {isMenuExpanded ? 'FEATURES' : 'FEAT'}
                </h3>
                <ul>
                    <li>
                        <button
                            onClick={() => onNavigate('image')}
                            className={`w-full flex items-center py-2 px-3 rounded-lg mb-2 ${
                                currentView === 'image' ? 'bg-purple-700 text-white font-medium' : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <ImageOutlineIcon className="w-5 h-5 mr-3" />
                            {isMenuExpanded && 'Image Generation'}
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => onNavigate('code')}
                            className={`w-full flex items-center py-2 px-3 rounded-lg mb-2 ${
                                currentView === 'code' ? 'bg-purple-700 text-white font-medium' : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <CodeIcon className="w-5 h-5 mr-3" />
                            {isMenuExpanded && 'Code Playground'}
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => onNavigate('deepResearch')}
                            className={`w-full flex items-center py-2 px-3 rounded-lg mb-2 ${
                                currentView === 'deepResearch' ? 'bg-purple-700 text-white font-medium' : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <DeepResearchIcon className="w-5 h-5 mr-3" />
                            {isMenuExpanded && 'Deep Research'}
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => onNavigate('canvas')}
                            className={`w-full flex items-center py-2 px-3 rounded-lg mb-2 ${
                                currentView === 'canvas' ? 'bg-purple-700 text-white font-medium' : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <CanvasIcon className="w-5 h-5 mr-3" />
                            {isMenuExpanded && 'Creative Canvas'}
                        </button>
                    </li>
                </ul>
            </div>

            {/* Bottom Section: Sign In/Out */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={onSignOut}
                    className="w-full flex items-center py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                >
                    <LogoutIcon className="w-5 h-5 mr-3" />
                    {isMenuExpanded && (auth?.currentUser && !auth.currentUser.isAnonymous ? 'Sign Out' : 'Sign In')}
                </button>
            </div>
        </aside>
    );
}
// ====================================================================================================
// END: Sidebar Component
// ====================================================================================================

// ====================================================================================================
// START: MainHeader Component (Extracted for reusability)
// This component renders the top header bar.
// ====================================================================================================
function MainHeader({ currentPlan, onSelectPlan, onSignOut, handleHeaderSearch, handleUpgradeClick, userId, isGuest }) {
    return (
        <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                     style={{
                         background: 'linear-gradient(to right bottom, #FF69B4, #FFD1DC)',
                         boxShadow: '0 0 8px rgba(255, 105, 180, 0.5)',
                         border: '1px solid rgba(255, 255, 255, 0.3)'
                     }}>
                    <span role="img" aria-label="brain emoji" style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))' }}>🧠</span>
                </div>
                <span className="text-lg font-semibold"
                      style={{
                          background: 'linear-gradient(to right, #8A2BE2, #4169E1)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          color: 'transparent'
                      }}>StellarMind AI</span>
                <PlanDropdown currentPlan={currentPlan} onSelectPlan={onSelectPlan} className="ml-4" isGuest={isGuest} />
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={handleHeaderSearch} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Search">
                    <SearchIcon />
                </button>
                <button onClick={handleUpgradeClick} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Upgrade">
                    <CrownIcon /> {/* Changed to CrownIcon */}
                </button>
                <ProfileDropdown onSignOut={onSignOut} userId={userId} />
            </div>
        </header>
    );
}
// ====================================================================================================
// END: MainHeader Component
// ====================================================================================================


// Helper function to generate a random UUID (Universally Unique Unique Identifier)
const generateUUID = () => crypto.randomUUID();

// Helper function for fetch with exponential backoff
// Moved to global scope to be accessible by all components that need it
const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            } else if (response.status === 404) {
                throw new Error(`Resource not found at ${url}. Please check the URL and deployment.`);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
            }
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            } else {
                throw error;
            }
        }
    }
};

// ====================================================================================================
// START: LoginPage Component
// Handles user sign-in and registration.
// ====================================================================================================
function LoginPage({ onLoginSuccess, onGoBack, auth }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false); // State for 2FA modal

    const handleEmailPasswordAuth = async (e) => {
        e.preventDefault();
        setError('');

        if (!auth) {
            setError("Firebase Auth is not initialized.");
            return;
        }

        try {
            if (isRegistering) {
                // For a real app, you'd use createUserWithEmailAndPassword here
                console.log("Simulating email/password registration...");
                // await createUserWithEmailAndPassword(auth, email, password);
            } else {
                // For a real app, you'd use signInWithEmailAndPassword here
                console.log("Simulating email/password login...");
                // await signInWithEmailAndPassword(auth, email, password);
            }
            setShow2FAModal(true); // Show 2FA modal on successful simulated login/registration
        } catch (err) {
            console.error("Authentication error:", err);
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        if (!auth) {
            setError("Firebase Auth is not initialized.");
            return;
        }

        try {
            const provider = new GoogleAuthProvider();
            // In a real deployment, if you encounter 'auth/unauthorized-domain' errors,
            // ensure the domain where your app is hosted (e.g., Netlify/Vercel URL)
            // is added to "Authorized domains" in your Firebase Console -> Authentication -> Settings.
            console.log("Attempting Google Sign-in...");
            await signInWithPopup(auth, provider);
            setShow2FAModal(true); // Show 2FA modal on successful Google Sign-in
        } catch (err) {
            console.error("Google Sign-in error:", err);
            setError(err.message);
        }
    };

    const handle2FAVerified = () => {
        setShow2FAModal(false);
        onLoginSuccess(); // Proceed to app after 2FA
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100 font-inter">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <button onClick={onGoBack} className="absolute top-4 left-4 text-gray-400 hover:text-white transition duration-150 ease-in-out">
                    <ArrowLeftIcon />
                </button>
                <h2 className="text-3xl font-bold text-center mb-6">
                    {isRegistering ? 'Register' : 'Sign In'} to StellarMind AI
                </h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="mt-1 block w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="your@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="mt-1 block w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        {isRegistering ? 'Register with Email' : 'Sign In with Email'}
                    </button>
                </form>

                <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative bg-gray-800 px-4 text-sm text-gray-400">OR</div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold shadow-md transition duration-150 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5 mr-2" />
                    Sign In with Google
                </button>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-blue-400 hover:text-blue-300 transition duration-150 ease-in-out text-sm"
                    >
                        {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                    </button>
                </div>
            </div>

            {show2FAModal && (
                <TwoFactorAuthModal
                    onVerify={handle2FAVerified}
                    onClose={() => setShow2FAModal(false)}
                />
            )}
        </div>
    );
}
// ====================================================================================================
// END: LoginPage Component
// ====================================================================================================


// ====================================================================================================
// START: LandingPage Component
// Displays information about StellarMind AI and its plans.
// ====================================================================================================
function LandingPage({ onSignInClick, onGuestAccess }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 font-inter p-4 overflow-y-auto">
            <h1 className="text-5xl font-extrabold text-white mb-6 text-center leading-tight">
                Welcome to <span className="text-purple-500">StellarMind AI</span>
            </h1>
            <p className="text-lg text-gray-300 mb-10 text-center max-w-2xl">
                Your ultimate AI Chat Assistant, Image Generator, Code Playground, and Creative Canvas.
                Unleash your productivity and creativity with powerful AI tools.
            </p>

            {/* About StellarMind AI Section */}
            <section className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-xl mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">What StellarMind AI Can Do For You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-lg text-gray-300">
                    <div className="flex items-start">
                        <span className="text-purple-400 mr-3 text-2xl">💬</span>
                        <div>
                            <h3 className="font-semibold text-white">Intelligent Chat</h3>
                            <p className="text-sm text-gray-400">Engage in dynamic conversations, get instant answers, and brainstorm ideas with our advanced AI chat assistant.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <span className="text-purple-400 mr-3 text-2xl">🖼️</span>
                        <div>
                            <h3 className="font-semibold text-white">Stunning Image Generation</h3>
                            <p className="text-sm text-gray-400">Transform your ideas into captivating visuals with our powerful AI image generator.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <span className="text-purple-400 mr-3 text-2xl">💻</span>
                        <div>
                            <h3 className="font-semibold text-white">Powerful Code Playground</h3>
                            <p className="text-sm text-gray-400">Write, test, and debug code with AI assistance. Get suggestions, explanations, and even generate code snippets.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <span className="text-purple-400 mr-3 text-2xl">🎨</span>
                        <div>
                            <h3 className="font-semibold text-white">Creative Canvas</h3>
                            <p className="text-sm text-gray-400">A dedicated space for creative writing, design, and multimedia projects, enhanced by AI capabilities.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <span className="text-purple-400 mr-3 text-2xl">🔬</span>
                        <div>
                            <h3 className="font-semibold text-white">Deep Research Capabilities</h3>
                            <p className="text-sm text-gray-400">Conduct in-depth research, summarize complex topics, and get insights from vast amounts of information.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <span className="text-purple-400 mr-3 text-2xl">⚡</span>
                        <div>
                            <h3 className="font-semibold text-white">Blazing Fast Performance</h3>
                            <p className="text-sm text-gray-400">Experience unparalleled speed and efficiency across all StellarMind AI features.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Plans Section (Modified to show all plans as "Free" with guest limits) */}
            <section className="w-full max-w-5xl mb-12">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">StellarMind AI Plans - All Features Accessible!</h2>
                <p className="text-lg text-gray-300 mb-8 text-center max-w-2xl mx-auto">
                    All users can explore the full range of StellarMind AI features. Registered users enjoy unlimited access, while guests have generous usage limits.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Basic Plan */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 flex flex-col">
                        <h3 className="text-2xl font-bold text-purple-400 mb-4 text-center">StellarMind Basic</h3>
                        <p className="text-gray-300 text-center mb-6">Free access with guest limits.</p>
                        <ul className="text-gray-400 space-y-2 flex-grow">
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Standard AI Chat (20 messages for guests, 50 for registered)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Image Generation (5/day for guests, 10 for registered)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Code Assistance (5/day for guests, 10 for registered)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Creative Canvas (5/day for guests, 10 for registered)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Deep Research (5/day for guests, 10 for registered)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Community Support</li>
                        </ul>
                        <div className="text-center mt-6">
                            <span className="text-4xl font-extrabold text-white">Free</span>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className={`bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 flex flex-col ${true ? 'opacity-50 cursor-not-allowed' : ''}`}> {/* Always grayed out for guests */}
                        <h3 className="text-2xl font-bold text-purple-500 mb-4 text-center">StellarMind Pro</h3>
                        <p className="text-gray-300 text-center mb-6">Unlock higher limits!</p>
                        <ul className="text-gray-400 space-y-2 flex-grow">
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> AI Chat (100 messages)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Image Generation (25/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Code Assistance (25/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Creative Canvas (25/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Deep Research (25/day)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Priority Support</li>
                        </ul>
                        <div className="text-center mt-6">
                            <span className="text-4xl font-extrabold text-white">Free</span>
                        </div>
                        {true && <p className="text-red-300 text-xs text-center mt-2">Sign in to unlock!</p>}
                    </div>

                    {/* Ultimate Plan */}
                    <div className={`bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 flex flex-col ${true ? 'opacity-50 cursor-not-allowed' : ''}`}> {/* Always grayed out for guests */}
                        <h3 className="text-2xl font-bold text-purple-400 mb-4 text-center">StellarMind Ultimate</h3>
                        <p className="text-gray-300 text-center mb-6">The complete suite for ultimate productivity.</p>
                        <ul className="text-gray-400 space-y-2 flex-grow">
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> AI Chat (Unlimited)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Image Generation (Unlimited)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Code Assistance (Unlimited)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Creative Canvas (Unlimited)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Deep Research (Unlimited)</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> API Access</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> 24/7 Premium Support</li>
                        </ul>
                        <div className="text-center mt-6">
                            <span className="text-4xl font-extrabold text-white">Free</span>
                        </div>
                        {true && <p className="text-red-300 text-xs text-center mt-2">Sign in to unlock!</p>}
                    </div>
                </div>
            </section>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12 w-full max-w-md">
                <button
                    onClick={onSignInClick}
                    className="flex-1 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-full text-white text-xl font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-75"
                >
                    Sign In for Full Access
                </button>
                <button
                    onClick={onGuestAccess}
                    className="flex-1 px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 text-xl font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-75"
                >
                    Continue as Guest
                </button>
            </div>

            <div className="mt-12 text-gray-400 text-sm">
                <p>&copy; 2025 StellarMind AI. All rights reserved.</p>
            </div>
        </div>
    );
}
// ====================================================================================================
// END: LandingPage Component
// ====================================================================================================


// ====================================================================================================
// START: Chat Component
// Handles chat functionality with AI and displays messages.
// ====================================================================================================
function Chat({ db, auth, userId, onSignOut, onNavigate, currentView, currentPlan, onSelectPlan }) {
    const [isMenuExpanded, setIsMenuExpanded] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const messagesEndRef = useRef(null);
    const { limits, decrementLimit, isGuest } = useContext(UserLimitContext);

    // State for simulating mic/attach behavior
    const [isRecording, setIsRecording] = useState(false);
    const [isAttachingFile, setIsAttachingFile] = useState(false);


    // Function to handle new chat
    const handleNewChat = () => {
        setMessages([]); // Clear all messages
        setInputMessage(''); // Clear input
        console.log("New chat started.");
    };

    // Function for header search button
    const handleHeaderSearch = () => {
        setModalMessage("Search feature coming soon!");
    };

    // Function for header notifications button (now Upgrade button)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const handleUpgradeClick = () => {
        setShowUpgradeModal(true);
    };

    // Effect to fetch messages from Firestore
    useEffect(() => {
        if (db && userId) {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const messagesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/messages`);
            const q = query(messagesCollectionRef);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                fetchedMessages.sort((a, b) => (a.timestamp?.toDate() || 0) - (b.timestamp?.toDate() || 0));

                setMessages(fetchedMessages);
            }, (error) => {
                console.error("Error fetching messages:", error);
                setModalMessage(`Error loading messages: ${error.message}`);
            });

            return () => unsubscribe();
        }
    }, [db, userId]);

    // Effect to scroll to the bottom of the chat when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Function to handle sending a new message
    const handleSendMessage = async () => {
        if (inputMessage.trim() === '' || !db || !userId || isSending) {
            console.log("Input is empty, Firebase not ready, or message already sending.");
            return;
        }

        // Check chat message limit for guests
        if (!decrementLimit('chatMessages')) {
            setModalMessage("You've reached the chat message limit for your current plan. Please upgrade for more access!");
            return;
        }

        setIsSending(true);

        const userMessageText = inputMessage;
        setInputMessage('');

        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const userMessage = {
            sender: 'user',
            text: userMessageText,
            timestamp: serverTimestamp(),
            time: time,
            userId: userId,
        };

        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/messages`), userMessage);

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: userMessageText }] });
            const payload = { contents: chatHistory };
            // For deployment, replace the empty string with your actual Gemini API Key.
            // Consider using environment variables for security in production.
            const apiKey = ""; // YOUR GEMINI API KEY HERE FOR DEPLOYMENT
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetchWithRetry(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            let aiResponseText = "Sorry, I couldn't generate a response.";
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                aiResponseText = result.candidates[0].content.parts[0].text;
            } else {
                console.warn("Unexpected API response structure:", result);
            }

            const aiMessage = {
                sender: 'ai',
                text: aiResponseText,
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                userId: 'StellarMindAI',
            };
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/messages`), aiMessage);

        } catch (e) {
            console.error("Error sending message or getting AI response: ", e);
            const errorMessage = {
                sender: 'ai',
                text: `Error: Could not get a response. ${e.message}. Please check your internet connection, ensure the API is running, and verify CORS settings if applicable.`,
                timestamp: serverTimestamp(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                userId: 'StellarMindAI',
            };
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/messages`), errorMessage);
            setModalMessage(`Failed to send message or get AI response: ${e.message}. Please check your internet connection, ensure the API is running, and verify CORS settings if applicable.`);
        } finally {
            setIsSending(false);
        }
    };

    // --- Enhanced Mic and Attach File Simulation Handlers ---
    const handleAttachFileClick = () => {
        setIsAttachingFile(true);
        setModalMessage("Simulating file attachment... In a full deployment, this would open a file selection dialog. Direct file system access is restricted in this sandbox environment.");
        setTimeout(() => setIsAttachingFile(false), 2000); // Simulate completion
    };

    const handleMicClick = () => {
        if (!isRecording) {
            setIsRecording(true);
            setModalMessage("Simulating voice recording... Speaking now! (Actual microphone access is restricted in this sandbox environment.)");
            // Simulate recording for a few seconds
            setTimeout(() => {
                setIsRecording(false);
                setModalMessage("Simulated recording finished. Processing voice input...");
                // Simulate processing
                setTimeout(() => setModalMessage("Simulated voice input processed."), 1500);
            }, 3000);
        } else {
            setIsRecording(false);
            setModalMessage("Simulated recording stopped.");
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-inter">
            <Sidebar
                isMenuExpanded={isMenuExpanded}
                setIsMenuExpanded={setIsMenuExpanded}
                onNavigate={onNavigate}
                currentView={currentView}
                onSignOut={onSignOut}
                auth={auth}
                handleNewChat={handleNewChat}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-gray-900">
                <MainHeader
                    currentPlan={currentPlan}
                    onSelectPlan={onSelectPlan}
                    onSignOut={onSignOut}
                    handleHeaderSearch={handleHeaderSearch}
                    handleUpgradeClick={handleUpgradeClick}
                    userId={userId}
                    isGuest={isGuest} // Pass isGuest to MainHeader for PlanDropdown
                />

                {/* Chat Display Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-lg">
                            <ChatIcon className="w-16 h-16 mb-4" />
                            <p>Start a new conversation with StellarMind AI...</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xl p-3 rounded-lg shadow-md ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-gray-700 text-gray-100 rounded-bl-none'
                                    }`}
                                >
                                    <p>{msg.text}</p>
                                    <span className="block text-right text-xs mt-1 text-gray-300 opacity-75">
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    {isSending && (
                        <div className="flex justify-start">
                            <div className="max-w-xl p-3 rounded-lg shadow-md bg-gray-700 text-gray-100 rounded-bl-none">
                                <div className="flex items-center">
                                    <div className="animate-pulse flex space-x-2">
                                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                    </div>
                                    <span className="ml-2 text-sm text-gray-400">StellarMind AI is typing...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input Area */}
                <div className="p-4 border-t border-gray-700 bg-gray-800">
                    <div className="relative flex items-center bg-gray-700 rounded-xl p-2">
                        <button
                            onClick={handleAttachFileClick}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            disabled={isSending || isRecording || isAttachingFile}
                        >
                            <PlusIcon />
                        </button>
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-400 px-3 py-2"
                            placeholder="Message StellarMind..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                            disabled={isSending || isRecording || isAttachingFile}
                        />
                        <button
                            onClick={handleMicClick}
                            className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                            disabled={isSending || isAttachingFile}
                        >
                            <MicIcon />
                        </button>
                        <button
                            onClick={handleSendMessage}
                            className="ml-2 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                            aria-label="Send message"
                            disabled={isSending || isRecording || isAttachingFile}
                        >
                            {isSending ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                </div>
                            ) : (
                                <SendIcon />
                            )}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 text-center">
                        StellarMind can make mistakes. Consider checking important information.
                    </p>
                </div>
            </main>
            <MessageModal message={modalMessage} onClose={() => setModalMessage('')} />
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onSignInClick={() => onNavigate('login')} isGuest={isGuest} />}
        </div>
    );
}
// ====================================================================================================
// END: Chat Component
// ====================================================================================================


// ====================================================================================================
// START: ImageGenerator Component
// Handles image generation functionality.
// ====================================================================================================
function ImageGenerator({ db, auth, userId, onSignOut, onNavigate, currentView, currentPlan, onSelectPlan }) {
    const [isMenuExpanded, setIsMenuExpanded] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const { limits, decrementLimit, isGuest } = useContext(UserLimitContext);

    // Function for header search button
    const handleHeaderSearch = () => {
        setModalMessage("Search feature coming soon!");
    };

    // Function for header notifications button (now Upgrade button)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const handleUpgradeClick = () => {
        setShowUpgradeModal(true);
    };

    const handleGenerateImage = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate an image.');
            return;
        }

        // Check image generation limit for guests
        if (!decrementLimit('imageGenerations')) {
            setModalMessage(`You've reached your image generation limit for your current plan. Please upgrade for more access!`);
            return;
        }

        setLoading(true);
        setError('');
        setImageUrl('');

        try {
            // Removed "on a simple white background" from the prompt
            const finalPrompt = `A clear, high-quality, photorealistic image of the following: "${prompt}"`;

            const payload = { instances: { prompt: finalPrompt }, parameters: { "sampleCount": 1 } };
            // For deployment, replace the empty string with your actual Gemini API Key.
            // Consider using environment variables for security in production.
            const apiKey = ""; // YOUR GEMINI API KEY HERE FOR DEPLOYMENT
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorText = `Image generation failed with status: ${response.status} ${response.statusText}.`;
                try {
                    const errorJson = await response.json();
                    errorText += ` Details: ${JSON.stringify(errorJson)}`;
                } catch (jsonError) {
                    const rawText = await response.text();
                    errorText += ` Raw response: ${rawText.substring(0, 200)}...`;
                }
                setError(errorText);
                console.error("API Response Error:", errorText);
                return;
            }

            const result = await response.json();

            if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
                const generatedImageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                setImageUrl(generatedImageUrl);

                if (db && userId) {
                    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                    await addDoc(collection(db, `artifacts/${appId}/users/${userId}/imageGenerations`), {
                        prompt: prompt,
                        timestamp: serverTimestamp(),
                        userId: userId,
                    });
                }
            } else {
                setError('Failed to generate image. The API response was valid but did not contain image data.');
                console.error("Image generation failed: No image data in predictions.", result);
            }
        } catch (err) {
            console.error("Error generating image:", err);
            setError(`An unexpected error occurred: ${err.message}. Please check your network connection or try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-inter">
            <Sidebar
                isMenuExpanded={isMenuExpanded}
                setIsMenuExpanded={setIsMenuExpanded}
                onNavigate={onNavigate}
                currentView={currentView}
                onSignOut={onSignOut}
                auth={auth}
                handleNewChat={() => onNavigate('chat')}
            />

            {/* Main Content Area for Image Generation */}
            <main className="flex-1 flex flex-col bg-gray-900">
                <MainHeader
                    currentPlan={currentPlan}
                    onSelectPlan={onSelectPlan}
                    onSignOut={onSignOut}
                    handleHeaderSearch={handleHeaderSearch}
                    handleUpgradeClick={handleUpgradeClick}
                    userId={userId}
                    isGuest={isGuest} // Pass isGuest to MainHeader for PlanDropdown
                />

                {/* Back to Chat Button */}
                <div className="p-4">
                    <button
                        onClick={() => onNavigate('chat')}
                        className="flex items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                    >
                        <ArrowLeftIcon className="mr-2" /> Back to Chat
                    </button>
                </div>

                {/* Image Generation Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 custom-scrollbar">
                    <div className="w-full max-w-7xl bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Generate Your Image</h2>
                        {limits.imageGenerations !== Infinity && (
                            <p className="text-sm text-gray-400 mb-4">
                                You have {limits.imageGenerations} image generations remaining for your {currentPlan} plan.
                            </p>
                        )}
                        <textarea
                            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 h-24 resize-none"
                            placeholder="Describe the image you want to generate (e.g., 'A futuristic city at sunset with flying cars')"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        ></textarea>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <button
                            onClick={handleGenerateImage}
                            className={`w-full py-3 px-4 rounded-lg text-white font-semibold shadow-md transition duration-150 ease-in-out
                                ${loading || limits.imageGenerations <= 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                            disabled={loading || limits.imageGenerations <= 0}
                        >
                            {loading ? 'Generating...' : 'Generate Image'}
                        </button>

                        {imageUrl && (
                            <div className="mt-8 text-center">
                                <h3 className="text-xl font-semibold text-white mb-4">Generated Image:</h3>
                                <img
                                    src={imageUrl}
                                    alt={`Generated image for prompt: "${prompt}"`}
                                    className="max-w-full h-auto rounded-lg shadow-lg border border-gray-700"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/333/FFF?text=Image+Load+Error"; }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <MessageModal message={modalMessage} onClose={() => setModalMessage('')} />
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onSignInClick={() => onNavigate('login')} isGuest={isGuest} />}
        </div>
    );
}
// ====================================================================================================
// END: ImageGenerator Component
// ====================================================================================================

// ====================================================================================================
// START: CodePlayground Component
// Allows users to write, run, and get AI assistance for code.
// ====================================================================================================
function CodePlayground({ db, auth, userId, onSignOut, onNavigate, currentView, currentPlan, onSelectPlan }) {
    const [isMenuExpanded, setIsMenuExpanded] = useState(true);
    const [aiGeneratedCode, setAiGeneratedCode] = useState('');
    const [aiRequestPrompt, setAiRequestPrompt] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    const [aiError, setAiError] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const { limits, decrementLimit, isGuest } = useContext(UserLimitContext);

    // Function for header search button
    const handleHeaderSearch = () => {
        setModalMessage("Search feature coming soon!");
    };

    // Function for header notifications button (now Upgrade button)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const handleUpgradeClick = () => {
        setShowUpgradeModal(true);
    };

    const handleGenerateCode = async () => {
        if (!aiRequestPrompt.trim()) {
            setAiError('Please enter a prompt for code generation.');
            return;
        }

        // Check code generation limit for guests
        if (!decrementLimit('codeGenerations')) {
            setModalMessage(`You've reached the code generation limit for your current plan. Please upgrade for more access!`);
            return;
        }

        setLoadingAi(true);
        setAiError('');
        setAiGeneratedCode('');

        try {
            const promptText = `Generate JavaScript code for the following request: "${aiRequestPrompt}". Provide only the code block, without any additional text, explanations, or comments outside the code block itself.`;

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: promptText }] });
            const payload = { contents: chatHistory };
            // For deployment, replace the empty string with your actual Gemini API Key.
            // Consider using environment variables for security in production.
            const apiKey = ""; // YOUR GEMINI API KEY HERE FOR DEPLOYMENT
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetchWithRetry(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                let generatedText = result.candidates[0].content.parts[0].text;

                // Regex to extract code from markdown block (e.g., ```javascript...```)
                const codeMatch = generatedText.match(/```(?:javascript|js|jsx|typescript|ts|tsx)?\n([\s\S]*?)\n```/);
                if (codeMatch && codeMatch[1]) {
                    setAiGeneratedCode(codeMatch[1].trim()); // Set only the code content
                } else {
                    // If no markdown block is found, assume the whole response is code (or an error/non-code response)
                    setAiGeneratedCode(generatedText.trim());
                    console.warn("No markdown code block found. Displaying raw AI response.");
                }
            } else {
                setAiError('Failed to get a valid AI response.');
            }
        } catch (e) {
            console.error("Error calling Gemini API for code generation:", e);
            setAiError(`An error occurred: ${e.message}. Please check your internet connection and API status.`);
        } finally {
            setLoadingAi(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-inter">
            <Sidebar
                isMenuExpanded={isMenuExpanded}
                setIsMenuExpanded={setIsMenuExpanded}
                onNavigate={onNavigate}
                currentView={currentView}
                onSignOut={onSignOut}
                auth={auth}
                handleNewChat={() => onNavigate('chat')}
            />

            {/* Main Content Area for Code Playground */}
            <main className="flex-1 flex flex-col bg-gray-900">
                <MainHeader
                    currentPlan={currentPlan}
                    onSelectPlan={onSelectPlan}
                    onSignOut={onSignOut}
                    handleHeaderSearch={handleHeaderSearch}
                    handleUpgradeClick={handleUpgradeClick}
                    userId={userId}
                    isGuest={isGuest} // Pass isGuest to MainHeader for PlanDropdown
                />

                {/* Back to Chat Button */}
                <div className="p-4">
                    <button
                        onClick={() => onNavigate('chat')}
                        className="flex items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                    >
                        <ArrowLeftIcon className="mr-2" /> Back to Chat
                    </button>
                </div>

                {/* Code Generation Area */}
                <div className="flex-1 flex flex-col p-6 custom-scrollbar">
                    <div className="w-full max-w-7xl mx-auto bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col flex-1">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">AI Code Generator</h2>
                        {limits.codeGenerations !== Infinity && (
                            <p className="text-sm text-gray-400 mb-4">
                                You have {limits.codeGenerations} code generations remaining for your {currentPlan} plan.
                            </p>
                        )}
                        {/* Prompt Input for Code Generation */}
                        <textarea
                            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 h-24 resize-none"
                            placeholder="Describe the code you want to generate (e.g., 'a function to calculate factorial in JavaScript')"
                            value={aiRequestPrompt}
                            onChange={(e) => setAiRequestPrompt(e.target.value)}
                            disabled={loadingAi}
                        ></textarea>

                        {aiError && <p className="text-red-500 mb-4">{aiError}</p>}
                        <button
                            onClick={handleGenerateCode}
                            className={`w-full py-3 px-6 rounded-lg text-white font-semibold shadow-md transition duration-150 ease-in-out mb-4
                                ${loadingAi || limits.codeGenerations <= 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                            disabled={loadingAi || limits.codeGenerations <= 0}
                        >
                            {loadingAi ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Generating Code...
                                </div>
                            ) : (
                                'Generate Code'
                            )}
                        </button>

                        {/* AI Generated Code Display */}
                        <div className="flex-1 p-4 font-mono text-sm bg-gray-900 text-gray-100 overflow-auto custom-scrollbar rounded-lg border border-gray-700">
                            {loadingAi ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                    <span className="ml-3 text-purple-400">Generating Code...</span>
                                </div>
                            ) : (
                                aiGeneratedCode ? (
                                    <pre className="whitespace-pre-wrap break-words">{aiGeneratedCode}</pre>
                                ) : (
                                    <p className="text-gray-500">Your generated code will appear here.</p>
                                )
                            )}
                        </div>

                        {/* Instructions Box */}
                        {aiGeneratedCode && (
                            <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600 shadow-md">
                                <h3 className="text-lg font-bold text-white mb-3">How to Use This Code:</h3>
                                <ul className="list-disc list-inside text-gray-300 text-sm space-y-2">
                                    <li><span className="font-semibold">Copy the Code:</span> Click the "Copy" button (if available) or manually select and copy the code from the box above.</li>
                                    <li><span className="font-semibold">Integrate:</span> Paste this code into your JavaScript file, a &lt;script&gt; tag in your HTML, or directly into your browser's developer console.</li>
                                    <li><span className="font-semibold">Execute:</span> If it's a function, call it with the necessary arguments (e.g., `yourFunctionName(arg1, arg2);`). If it's a script, ensure it's placed where it will execute as intended.</li>
                                    <li><span className="font-semibold">Test & Debug:</span> Always test the generated code in your environment and debug any issues that arise.</li>
                                </ul>
                                <p className="text-xs text-gray-400 mt-3">
                                    Note: The AI generates code based on your prompt and may require adjustments for your specific project.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <MessageModal message={modalMessage} onClose={() => setModalMessage('')} />
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onSignInClick={() => onNavigate('login')} isGuest={isGuest} />}
        </div>
    );
}
// ====================================================================================================
// END: CodePlayground Component
// ====================================================================================================

// ====================================================================================================
// START: CreativeCanvas Component
// A dedicated space for creative writing, enhanced by AI.
// ====================================================================================================
function CreativeCanvas({ db, auth, userId, onSignOut, onNavigate, currentView, currentPlan, onSelectPlan }) {
    const [isMenuExpanded, setIsMenuExpanded] = useState(true);
    const [canvasPrompt, setCanvasPrompt] = useState('');
    const [canvasContent, setCanvasContent] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    const [generatingType, setGeneratingType] = useState('');
    const [aiError, setAiError] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const { limits, decrementLimit, isGuest } = useContext(UserLimitContext);

    // Firestore document reference for the canvas content
    const canvasDocRef = useRef(null);

    // Function for header search button
    const handleHeaderSearch = () => {
        setModalMessage("Search feature coming soon!");
    };

    // Function for header notifications button (now Upgrade button)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const handleUpgradeClick = () => {
        setShowUpgradeModal(true);
    };

    // Effect to load content from Firestore on mount
    useEffect(() => {
        if (db && userId) {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            canvasDocRef.current = doc(db, `artifacts/${appId}/users/${userId}/creativeCanvas/main`);

            const fetchContent = async () => {
                try {
                    const docSnap = await getDoc(canvasDocRef.current);
                    if (docSnap.exists()) {
                        setCanvasContent(docSnap.data().content || '');
                    } else {
                        console.log("No creative canvas content found, starting fresh.");
                    }
                } catch (e) {
                    console.error("Error fetching creative canvas content:", e);
                    setAiError("Failed to load canvas content.");
                }
            };
            fetchContent();
        }
    }, [db, userId]);

    // Effect to save content to Firestore on changes (debounced)
    useEffect(() => {
        if (!db || !userId || !canvasDocRef.current) return;

        const handler = setTimeout(async () => {
            try {
                await setDoc(canvasDocRef.current, { content: canvasContent, timestamp: serverTimestamp() }, { merge: true });
                console.log("Creative canvas content saved.");
            } catch (e) {
                console.error("Error saving creative canvas content:", e);
                setAiError("Failed to save canvas content automatically.");
            }
        }, 1000); // Save after 1 second of no typing

        return () => {
            clearTimeout(handler);
        };
    }, [canvasContent, db, userId]);

    const handleAiEnhance = async () => {
        if (!canvasPrompt.trim()) {
            setAiError('Please enter a prompt before asking AI to generate content.');
            return;
        }

        // Check canvas generation limit for guests
        if (!decrementLimit('canvasGenerations')) {
            setModalMessage(`You've reached the creative canvas generation limit for your current plan. Please upgrade for more access!`);
            return;
        }

        setLoadingAi(true);
        setAiError('');
        setCanvasContent('');

        let type = 'Content';
        if (canvasPrompt.toLowerCase().includes('story')) {
            type = 'Story';
        } else if (canvasPrompt.toLowerCase().includes('poem')) {
            type = 'Poem';
        } else if (canvasPrompt.toLowerCase().includes('script')) {
            type = 'Script';
        }
        setGeneratingType(type);

        try {
            let promptText = `Generate a ${type.toLowerCase()} based on the following prompt: "${canvasPrompt}".`;

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: promptText }] });
            const payload = { contents: chatHistory };
            // For deployment, replace the empty string with your actual Gemini API Key.
            // Consider using environment variables for security in production.
            const apiKey = ""; // YOUR GEMINI API KEY HERE FOR DEPLOYMENT
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetchWithRetry(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const aiGeneratedText = result.candidates[0].content.parts[0].text;
                setCanvasContent(aiGeneratedText);
            } else {
                setAiError('Failed to get a valid AI response.');
            }
        } catch (e) {
            console.error("Error calling Gemini API for creative canvas:", e);
            setAiError(`An error occurred: ${e.message}. Please check your internet connection and API status.`);
        } finally {
            setLoadingAi(false);
            setGeneratingType('');
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-inter">
            <Sidebar
                isMenuExpanded={isMenuExpanded}
                setIsMenuExpanded={setIsMenuExpanded}
                onNavigate={onNavigate}
                currentView={currentView}
                onSignOut={onSignOut}
                auth={auth}
                handleNewChat={() => onNavigate('chat')}
            />

            {/* Main Content Area for Creative Canvas */}
            <main className="flex-1 flex flex-col bg-gray-900">
                <MainHeader
                    currentPlan={currentPlan}
                    onSelectPlan={onSelectPlan}
                    onSignOut={onSignOut}
                    handleHeaderSearch={handleHeaderSearch}
                    handleUpgradeClick={handleUpgradeClick}
                    userId={userId}
                    isGuest={isGuest} // Pass isGuest to MainHeader for PlanDropdown
                />

                {/* Back to Chat Button */}
                <div className="p-4">
                    <button
                        onClick={() => onNavigate('chat')}
                        className="flex items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                    >
                        <ArrowLeftIcon className="mr-2" /> Back to Chat
                    </button>
                </div>

                {/* Creative Canvas Area */}
                <div className="flex-1 flex flex-col p-6 custom-scrollbar">
                    <div className="w-full max-w-7xl mx-auto bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col flex-1">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">Creative Canvas</h2>
                        {limits.canvasGenerations !== Infinity && (
                            <p className="text-sm text-gray-400 mb-4">
                                You have {limits.canvasGenerations} content generations remaining for your {currentPlan} plan.
                            </p>
                        )}
                        {/* Prompt Input */}
                        <div className="mb-4">
                            <label htmlFor="canvas-prompt" className="block text-sm font-medium text-gray-300 mb-2">Your Prompt:</label>
                            <textarea
                                id="canvas-prompt"
                                className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                                placeholder="Enter your creative prompt (e.g., 'Write a short story about a talking cat', 'Generate a poem about the ocean')"
                                value={canvasPrompt}
                                onChange={(e) => setCanvasPrompt(e.target.value)}
                                spellCheck="true"
                                disabled={loadingAi}
                            ></textarea>
                        </div>

                        {aiError && <p className="text-red-500 mb-4">{aiError}</p>}
                        <button
                            onClick={handleAiEnhance}
                            className={`py-3 px-6 rounded-lg text-white font-semibold shadow-md transition duration-150 ease-in-out mb-4
                                ${loadingAi || limits.canvasGenerations <= 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                            disabled={loadingAi || limits.canvasGenerations <= 0}
                        >
                            {loadingAi ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Generating {generatingType}...
                                </div>
                            ) : (
                                'Ask AI to Generate'
                            )}
                        </button>

                        {/* Generated Content Display */}
                        <div className="flex-1 p-4 font-sans text-base bg-gray-900 text-gray-100 overflow-auto custom-scrollbar rounded-lg border border-gray-700">
                            {loadingAi ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                    <span className="ml-3 text-purple-400">Generating {generatingType}...</span>
                                </div>
                            ) : (
                                canvasContent ? (
                                    <pre className="whitespace-pre-wrap break-words">{canvasContent}</pre>
                                ) : (
                                    <p className="text-gray-500">Your generated content will appear here.</p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <MessageModal message={modalMessage} onClose={() => setModalMessage('')} />
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onSignInClick={() => onNavigate('login')} isGuest={isGuest} />}
        </div>
    );
}
// ====================================================================================================
// END: CreativeCanvas Component
// ====================================================================================================

// ====================================================================================================
// START: DeepResearch Component
// Allows users to perform deep research with AI assistance.
// ====================================================================================================
function DeepResearch({ db, auth, userId, onSignOut, onNavigate, currentView, currentPlan, onSelectPlan }) {
    const [isMenuExpanded, setIsMenuExpanded] = useState(true);
    const [queryText, setQueryText] = useState('');
    const [researchResult, setResearchResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const { limits, decrementLimit, isGuest } = useContext(UserLimitContext);

    // Function for header search button
    const handleHeaderSearch = () => {
        setModalMessage("Search feature coming soon!");
    };

    // Function for header notifications button (now Upgrade button)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const handleUpgradeClick = () => {
        setShowUpgradeModal(true);
    };

    const handleSearch = async () => {
        if (!queryText.trim()) {
            setError('Please enter a research query.');
            return;
        }

        // Check deep research limit for guests
        if (!decrementLimit('deepResearchQueries')) {
            setModalMessage(`You've reached the deep research query limit for your current plan. Please upgrade for more access!`);
            return;
        }

        setLoading(true);
        setResearchResult('');
        setError('');

        // The API key is intentionally left as an empty string here for Canvas runtime injection.
        // For deployment, you would replace this empty string with your actual Gemini API Key.
        // Consider using environment variables for security in production deployments.
        const apiKey = ""; // YOUR GEMINI API KEY HERE FOR DEPLOYMENT
        const llmApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            console.log("Directly querying LLM for comprehensive research summary.");
            // Direct LLM call for research summary with a more detailed prompt, explicitly avoiding markdown.
            const llmPrompt = `As a highly knowledgeable research assistant, provide a comprehensive, detailed, and well-structured summary for the following topic: "${queryText}".
            Present the information in clear, continuous paragraphs, without using any markdown formatting symbols like hashtags (#), asterisks (*), underscores (_), or bullet points.
            Ensure the response covers:
            1.  Key facts and definitions.
            2.  Current understanding or status.
            3.  Potential impacts or implications.
            4.  Future outlook or predictions (if applicable and based on current trends).
            Provide direct, informative content.
            `;

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: llmPrompt }] });
            const llmPayload = { contents: chatHistory };
            

            const llmResponse = await fetchWithRetry(llmApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(llmPayload)
            });

            let llmResult;
            const llmContentType = llmResponse.headers.get('content-type');
            if (llmContentType && llmContentType.includes('application/json')) {
                llmResult = await llmResponse.json();
            } else {
                const rawText = await llmResponse.text();
                throw new Error(`Expected JSON from LLM API, but received ${llmContentType || 'no content type'}. Raw response: ${rawText.substring(0, 200)}...`);
            }

            if (llmResult.candidates && llmResult.candidates.length > 0 &&
                llmResult.candidates[0].content && llmResult.candidates[0].content.parts &&
                llmResult.candidates[0].content.parts.length > 0) {
                const finalResult = llmResult.candidates[0].content.parts[0].text;
                setResearchResult(finalResult);

                 if (db && userId) {
                    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                    await addDoc(collection(db, `artifacts/${appId}/users/${userId}/deepResearchQueries`), {
                        query: queryText,
                        result: finalResult,
                        timestamp: serverTimestamp(),
                        userId: userId,
                    });
                }
            } else {
                setError('Failed to get a valid AI research summary. The LLM response was empty or malformed.');
            }

        } catch (e) {
            console.error("Error during deep research (LLM call):", e);
            setError(`An error occurred during research: ${e.message}. This is likely a network issue or the LLM service is temporarily unavailable. Please try again.`);
        } finally {
                setLoading(false);
            }
        };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-inter">
            <Sidebar
                isMenuExpanded={isMenuExpanded}
                setIsMenuExpanded={setIsMenuExpanded}
                onNavigate={onNavigate}
                currentView={currentView}
                onSignOut={onSignOut}
                auth={auth}
                handleNewChat={() => onNavigate('chat')}
            />

            {/* Main Content Area for Deep Research */}
            <main className="flex-1 flex flex-col bg-gray-900">
                <MainHeader
                    currentPlan={currentPlan}
                    onSelectPlan={onSelectPlan}
                    onSignOut={onSignOut}
                    handleHeaderSearch={handleHeaderSearch}
                    handleUpgradeClick={handleUpgradeClick}
                    userId={userId}
                    isGuest={isGuest} // Pass isGuest to MainHeader for PlanDropdown
                />

                {/* Back to Chat Button */}
                <div className="p-4">
                    <button
                        onClick={() => onNavigate('chat')}
                        className="flex items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                    >
                        <ArrowLeftIcon className="mr-2" /> Back to Chat
                    </button>
                </div>

                {/* Deep Research Area */}
                <div className="flex-1 flex flex-col p-6 custom-scrollbar">
                    <div className="w-full max-w-7xl mx-auto bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col flex-1">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">Deep Research</h2>
                        {limits.deepResearchQueries !== Infinity && (
                            <p className="text-sm text-gray-400 mb-4">
                                You have {limits.deepResearchQueries} deep research queries remaining for your {currentPlan} plan.
                            </p>
                        )}
                        <textarea
                            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 h-24 resize-none"
                            placeholder="Enter your research query (e.g., 'What are the effects of climate change on polar bears?')"
                            value={queryText}
                            onChange={(e) => setQueryText(e.target.value)}
                            disabled={loading}
                        ></textarea>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <button
                            onClick={handleSearch}
                            className={`w-full py-3 px-6 rounded-lg text-white font-semibold shadow-md transition duration-150 ease-in-out
                                ${loading || limits.deepResearchQueries <= 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                            disabled={loading || limits.deepResearchQueries <= 0}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Researching...
                                </div>
                            ) : (
                                'Perform Deep Research'
                            )}
                        </button>

                        {researchResult && (
                            <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700 flex-1 overflow-y-auto">
                                <h3 className="text-xl font-semibold text-white mb-3">Research Summary:</h3>
                                <pre className="text-gray-200 whitespace-pre-wrap font-sans">{researchResult}</pre>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <MessageModal message={modalMessage} onClose={() => setModalMessage('')} />
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onSignInClick={() => onNavigate('login')} isGuest={isGuest} />}
        </div>
    );
}
// ====================================================================================================
// END: DeepResearch Component
// ====================================================================================================

// ====================================================================================================
// START: Main App Component
// Handles overall routing and Firebase initialization.
// ====================================================================================================
function App() {
    const [currentView, setCurrentView] = useState('landing');
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [currentPlan, setCurrentPlan] = useState('Basic'); // Still track for display, but features are unlocked
    const [show2FAModal, setShow2FAModal] = useState(false); // State to show 2FA modal
    const [pendingLoginSuccess, setPendingLoginSuccess] = useState(false); // To handle post-2FA navigation

    // Effect hook for Firebase initialization and authentication.
    useEffect(() => {
        // IMPORTANT: For deployment outside Canvas (e.g., Netlify, Vercel),
        // you MUST replace this placeholder with your actual Firebase project configuration.
        // You can find this in your Firebase Console -> Project settings -> General -> Your apps -> Web app -> Config.
        const firebaseConfig = {
            apiKey: "YOUR_FIREBASE_API_KEY", // Replace with your Firebase Web API Key
            authDomain: "YOUR_FIREBASE_PROJECT_ID.firebaseapp.com", // Replace with your Firebase Auth Domain
            projectId: "YOUR_FIREBASE_PROJECT_ID", // Replace with your Firebase Project ID
            storageBucket: "YOUR_FIREBASE_PROJECT_ID.appspot.com", // Replace with your Firebase Storage Bucket
            messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID", // Replace with your Firebase Messaging Sender ID
            appId: "YOUR_FIREBASE_APP_ID" // Replace with your Firebase App ID
        };

        // The __firebase_config and __initial_auth_token are provided by the Canvas environment.
        // For external deployment, the above firebaseConfig object will be used.
        // The anonymous/custom token sign-in logic below is primarily for Canvas.
        // For external deployment, you'll rely on standard Firebase Auth methods (Google, Email/Password etc.)
        const canvasFirebaseConfig = typeof __firebase_config !== 'undefined'
            ? JSON.parse(__firebase_config)
            : null;

        const app = initializeApp(canvasFirebaseConfig || firebaseConfig); // Use Canvas config if available, else hardcoded
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);

        setAuth(authInstance);
        setDb(dbInstance);

        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
            if (user) {
                setUserId(user.uid);
                setIsGuest(user.isAnonymous);
                if (!user.isAnonymous) {
                    setCurrentPlan('Basic'); // Default registered users to 'Basic'
                }
                console.log("User ID set:", user.uid, "Is Guest:", user.isAnonymous);
            } else {
                try {
                    // This block is mainly for Canvas environment's auto-sign-in.
                    // For external deployment, users will explicitly sign in via Google/Email/Password.
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token && !canvasFirebaseConfig) {
                        console.log("Attempting custom token sign-in (Canvas environment).");
                        const userCredential = await signInWithCustomToken(authInstance, __initial_auth_token);
                        setUserId(userCredential.user.uid);
                        setIsGuest(userCredential.user.isAnonymous);
                        if (!userCredential.user.isAnonymous) {
                            setCurrentPlan('Basic');
                        }
                    } else {
                        console.log("Attempting anonymous sign-in (for external deployment or if Canvas token is missing).");
                        const userCredential = await signInAnonymously(authInstance);
                        setUserId(userCredential.user.uid);
                        setIsGuest(true);
                        setCurrentPlan('Basic'); // Guests always start with Basic's limits
                    }
                } catch (error) {
                    console.error("Firebase Auth Error (Anonymous/Custom Token fallback):", error);
                    const fallbackUserId = generateUUID();
                    setUserId(fallbackUserId);
                    setIsGuest(true);
                    setCurrentPlan('Basic'); // Guests always start with Basic's limits
                    console.log("Fallback User ID generated:", fallbackUserId);
                }
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    const handleLoginSuccess = () => {
        // Instead of directly navigating, set a flag to show 2FA modal
        setPendingLoginSuccess(true);
        setShow2FAModal(true);
    };

    const handle2FAVerified = () => {
        setShow2FAModal(false);
        setPendingLoginSuccess(false); // Clear the flag
        setIsGuest(false); // User is now logged in
        setCurrentPlan('Basic'); // Default registered users to Basic plan
        setCurrentView('chat'); // Navigate to chat after 2FA
    };

    const handleGuestAccess = () => {
        setIsGuest(true);
        setCurrentPlan('Basic'); // Ensure guest is on Basic plan limits
        setCurrentView('chat');
    };

    const handleLogout = async () => {
        if (auth) {
            try {
                await signOut(auth);
                console.log("User signed out.");
            } catch (error) {
                console.error("Error signing out:", error);
            }
        }
        setUserId(null);
        setIsGuest(false);
        setCurrentPlan('Basic'); // Reset plan on logout
        setCurrentView('landing');
    };

    const handleSelectPlan = (plan) => {
        if (!isGuest) { // Only allow plan changes for non-guests
            setCurrentPlan(plan);
            console.log(`Plan selected: ${plan}`);
        } else {
            console.log("Guests cannot change plans. Please sign in.");
        }
    };

    const renderContent = () => {
        if (!isAuthReady) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                    <div className="text-xl font-semibold">Loading StellarMind AI Platform...</div>
                </div>
            );
        }

        const commonProps = {
            db,
            auth,
            userId,
            onSignOut: handleLogout,
            onNavigate: setCurrentView,
            currentView,
            currentPlan,
            onSelectPlan: handleSelectPlan,
            isGuest,
        };

        return (
            <UserLimitProvider isGuest={isGuest} currentPlan={currentPlan}>
                {(() => {
                    switch (currentView) {
                        case 'landing':
                            return <LandingPage onSignInClick={() => setCurrentView('login')} onGuestAccess={handleGuestAccess} />;
                        case 'login':
                            return <LoginPage onLoginSuccess={handleLoginSuccess} onGoBack={() => setCurrentView('landing')} auth={auth} />;
                        case 'chat':
                            return <Chat {...commonProps} />;
                        case 'image':
                            return <ImageGenerator {...commonProps} />;
                        case 'code':
                            return <CodePlayground {...commonProps} />;
                        case 'canvas':
                            return <CreativeCanvas {...commonProps} />;
                        case 'deepResearch':
                            return <DeepResearch {...commonProps} />;
                        default:
                            return <LandingPage onSignInClick={() => setCurrentView('login')} onGuestAccess={handleGuestAccess} />;
                    }
                })()}
                {show2FAModal && (
                    <TwoFactorAuthModal
                        onVerify={handle2FAVerified}
                        onClose={() => setShow2FAModal(false)} // Allow closing 2FA modal
                    />
                )}
            </UserLimitProvider>
        );
    };

    return (
        <div className="font-sans antialiased text-gray-100 bg-gray-900 min-h-screen flex flex-col">
            {renderContent()}
        </div>
    );
}

export default App;
