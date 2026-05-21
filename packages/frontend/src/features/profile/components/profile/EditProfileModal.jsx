import React, { useState, useEffect, useRef } from 'react';
import { useAuthActions } from '../../../../app/store/authStore';
import { countries } from '../../../../shared/utils/countries';

const EditProfileModal = ({ isOpen, onClose, currentData, onUpdate, onSave, loading }) => {
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const updateUser = useAuthActions().updateUser;
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (currentData) {
      setUsername(currentData.user?.username || '');
      setCountry(currentData.profile?.country || '');
      setSearchTerm(currentData.profile?.country || '');
    }
  }, [currentData, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (c) => {
    setCountry(c.name);
    setSearchTerm(c.name);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await onSave({ username, country });
      
      // Update global auth state
      if (response?.user) {
        updateUser({ 
          username: response.user.username,
          country: response.profile?.country 
        });
      }
      
      onClose();
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  const selectedCountryObj = countries.find(c => c.name === country);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative glass-panel w-full max-w-md rounded-2xl border border-outline-variant/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold font-headline tracking-tighter text-on-surface">Edit Persona</h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">Username</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium"
                placeholder="Enter new username"
                required
              />
            </div>

            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">Country</label>
              <div 
                className={`w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface flex items-center gap-2 cursor-pointer transition-all ${isDropdownOpen ? 'ring-2 ring-primary/50' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedCountryObj ? (
                  <span className="text-xl">{selectedCountryObj.flag}</span>
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant">public</span>
                )}
                <span className={country ? 'text-on-surface font-medium' : 'text-on-surface-variant'}>
                  {country || 'Select your country'}
                </span>
                <span className="material-symbols-outlined ml-auto text-on-surface-variant">
                  {isDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-2xl overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-outline-variant/10">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                      <input 
                        autoFocus
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary/30"
                        placeholder="Search country..."
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar py-2">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((c) => (
                        <div 
                          key={c.code}
                          onClick={() => handleCountrySelect(c)}
                          className={`flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors ${country === c.name ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                        >
                          <span className="text-xl">{c.flag}</span>
                          <span className="text-sm font-medium">{c.name}</span>
                          {country === c.name && (
                            <span className="material-symbols-outlined ml-auto text-sm">check</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-xs text-on-surface-variant italic">No countries found.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold text-lg tracking-tight shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
      </div>
    </div>
  );
};

export default EditProfileModal;
