import React, { useState, useEffect, useRef } from 'react';
import { useYep } from '../../context/YepContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  X,
  Camera,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Save,
  Link as LinkIcon
} from 'lucide-react';

const REGION_OPTIONS = [
  'East Africa (Kampala, Uganda)',
  'East Africa (Nairobi, Kenya)',
  'East Africa (Kigali, Rwanda)',
  'East Africa (Dar es Salaam, Tanzania)',
  'West Africa (Lagos, Nigeria)',
  'West Africa (Accra, Ghana)',
  'North Africa (Cairo, Egypt)',
  'Southern Africa (Johannesburg, South Africa)'
];

export const EditProfileModal: React.FC = () => {
  const { users, editingProfileUserId, closeProfileEditor, updateProfile } = useYep();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const targetUser = editingProfileUserId
    ? users.find(u => u.id === editingProfileUserId) || null
    : null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrlDraft, setImageUrlDraft] = useState('');
  const [age, setAge] = useState<string>('');
  const [titleOrOrg, setTitleOrOrg] = useState('');
  const [region, setRegion] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [interestsText, setInterestsText] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [bio, setBio] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  useEffect(() => {
    if (targetUser) {
      setName(targetUser.name || '');
      setEmail(targetUser.email || '');
      setAvatarUrl(targetUser.avatarUrl);
      setImageUrlDraft(
        targetUser.avatarUrl && !targetUser.avatarUrl.startsWith('data:')
          ? targetUser.avatarUrl
          : ''
      );
      setShowUrlInput(false);
      setAge(targetUser.age ? String(targetUser.age) : '');
      setTitleOrOrg(targetUser.titleOrOrg || '');
      setRegion(targetUser.region || REGION_OPTIONS[0]);
      setSkillsText((targetUser.skills || []).join(', '));
      setInterestsText((targetUser.interests || []).join(', '));
      setCareerGoal(targetUser.careerGoal || '');
      setBio(targetUser.bio || '');
      setErrorMsg(null);
      setSavedMsg(null);
    }
  }, [targetUser?.id, editingProfileUserId]);

  if (!targetUser) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(t('Please choose a valid image file (PNG, JPG, or WebP).'));
      return;
    }

    setErrorMsg(null);
    setIsProcessingPhoto(true);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 240;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(dataUrl);
          setImageUrlDraft('');
        }
        setIsProcessingPhoto(false);
      };
      img.onerror = () => {
        setErrorMsg(t('Could not process that image file. Please try another photo.'));
        setIsProcessingPhoto(false);
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.onerror = () => {
      setErrorMsg(t('Could not read the selected image file.'));
      setIsProcessingPhoto(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyImageUrl = () => {
    const trimmed = imageUrlDraft.trim();
    if (!trimmed) {
      setAvatarUrl(undefined);
      setShowUrlInput(false);
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed) && !trimmed.startsWith('data:image/')) {
      setErrorMsg(t('Please enter a valid http(s) image URL.'));
      return;
    }
    setErrorMsg(null);
    setAvatarUrl(trimmed);
    setShowUrlInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSavedMsg(null);

    const parsedSkills = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const parsedInterests = interestsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedAge = age.trim() ? parseInt(age, 10) : undefined;

    const result = updateProfile(
      {
        name,
        email,
        avatarUrl,
        age: targetUser.role === 'participant' ? parsedAge : targetUser.age,
        titleOrOrg: titleOrOrg.trim(),
        region: region.trim() || targetUser.region,
        skills: parsedSkills,
        interests: parsedInterests,
        careerGoal: careerGoal.trim() || undefined,
        bio: bio.trim()
      },
      targetUser.id
    );

    if (!result.success) {
      setErrorMsg(t(result.error || 'Could not save profile changes.'));
      return;
    }

    setSavedMsg(t('Profile updated successfully.'));
    setTimeout(() => {
      closeProfileEditor();
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div>
            <h2 id="edit-profile-title" className="text-base font-bold text-slate-900">
              {t('Edit Personal Profile')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('Update your name, profile photo, regional hub, and bio across the platform.')}
            </p>
          </div>
          <button
            type="button"
            onClick={closeProfileEditor}
            aria-label={t('Close')}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="font-medium">{savedMsg}</span>
            </div>
          )}

          {/* Profile Picture & Name Preview Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <UserAvatar
                name={name || targetUser.name}
                role={targetUser.role}
                avatarUrl={avatarUrl}
                size="xl"
              />
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">
                  {name || targetUser.name}
                </div>
                <div className="text-[11px] text-slate-500 capitalize">
                  {targetUser.role} · {avatarUrl ? t('Custom photo active') : t('Initials badge active')}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isProcessingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isProcessingPhoto ? t('Processing...') : t('Upload Photo')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(prev => !prev)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{t('Photo URL')}</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarUrl(undefined);
                    setImageUrlDraft('');
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('Use Initials')}</span>
                </button>
              )}
            </div>
          </div>

          {showUrlInput && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <input
                type="url"
                value={imageUrlDraft}
                onChange={e => setImageUrlDraft(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleApplyImageUrl}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium cursor-pointer"
              >
                {t('Apply')}
              </button>
            </div>
          )}

          {/* Core Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('Full Name')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Masa David"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('Email Address')} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('Title or Organization')}
              </label>
              <input
                type="text"
                value={titleOrOrg}
                onChange={e => setTitleOrOrg(e.target.value)}
                placeholder={t('e.g. Frontend Developer, Mentor, Tech Partner')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('Regional Hub / Location')}
              </label>
              <select
                value={REGION_OPTIONS.includes(region) ? region : '__custom__'}
                onChange={e => {
                  if (e.target.value !== '__custom__') {
                    setRegion(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {REGION_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                {!REGION_OPTIONS.includes(region) && region && (
                  <option value="__custom__">{region}</option>
                )}
              </select>
            </div>

            {targetUser.role === 'participant' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('Age (18–35 Eligible)')} *
                </label>
                <input
                  type="number"
                  min={18}
                  max={35}
                  required
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div className={targetUser.role === 'participant' ? '' : 'sm:col-span-2'}>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('Career Goal / Focus Area')}
              </label>
              <input
                type="text"
                value={careerGoal}
                onChange={e => setCareerGoal(e.target.value)}
                placeholder={t('e.g. Build accessible low-bandwidth digital solutions')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('Declared Skills (comma-separated)')}
              </label>
              <input
                type="text"
                value={skillsText}
                onChange={e => setSkillsText(e.target.value)}
                placeholder="React, TypeScript, Data Analysis"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('Learning & Program Interests (comma-separated)')}
              </label>
              <input
                type="text"
                value={interestsText}
                onChange={e => setInterestsText(e.target.value)}
                placeholder="Cloud & Web Dev, AI & Data Analytics"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('Personal Bio')}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder={t('Share your background, goals, and areas of focus...')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeProfileEditor}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('Save Profile Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
