import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const SiteSettingsPage: React.FC = () => {
    const { siteSettings, updateSiteSettings } = useAppContext();
    const [heroTitle, setHeroTitle] = useState(siteSettings.heroTitle);
    const [heroSubtitle, setHeroSubtitle] = useState(siteSettings.heroSubtitle);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSiteSettings({ heroTitle, heroSubtitle });
        setSuccessMessage('Site settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Site Settings</h1>
            <div className="max-w-2xl">
                <div className="bg-secondary p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-accent-blue mb-6">Homepage Hero Content</h2>
                    {successMessage && <div className="bg-green-500/20 text-green-300 p-3 rounded-md mb-4">{successMessage}</div>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="heroTitle" className="block text-sm font-medium text-text-secondary">Hero Title</label>
                            <input 
                                type="text" 
                                id="heroTitle" 
                                value={heroTitle} 
                                onChange={e => setHeroTitle(e.target.value)} 
                                required 
                                className="mt-1 block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue" 
                            />
                             <p className="mt-2 text-xs text-gray-500">This text will have the typing animation.</p>
                        </div>
                         <div>
                            <label htmlFor="heroSubtitle" className="block text-sm font-medium text-text-secondary">Hero Subtitle</label>
                            <textarea 
                                id="heroSubtitle" 
                                value={heroSubtitle} 
                                onChange={e => setHeroSubtitle(e.target.value)} 
                                required 
                                rows={3} 
                                className="mt-1 block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue" 
                            />
                        </div>
                        <div>
                            <button 
                                type="submit" 
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary bg-accent-blue hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-800"
                            >
                                Save Settings
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SiteSettingsPage;