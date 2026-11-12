import React, { useState } from 'react';
import { useYep } from '../../context/YepContext';
import { UserRole } from '../../types/yep';
import { X, ShieldCheck, Check, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { registerUser } = useYep();

  const [role, setRole] = useState<UserRole>('participant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number>(23);
  const [region, setRegion] = useState('West Africa (Lagos, Nigeria)');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Git');
  const [interestsInput, setInterestsInput] = useState('Cloud & Web Dev, AI & Data Analytics');
  const [careerGoal, setCareerGoal] = useState('Junior Software Engineer or Digital Apprentice');
  const [bio, setBio] = useState('Excited to participate in virtual cohorts and collaborate on community solutions.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password strength validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordStrong = hasMinLength && hasNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isPasswordStrong) {
      setErrorMsg('Password must be at least 8 characters long and contain at least one numeric digit.');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const interests = interestsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const res = registerUser({
      name,
      email,
      password,
      role,
      age: role === 'participant' ? Number(age) : undefined,
      region,
      skills,
      interests,
      careerGoal,
      bio
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to complete registration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create YEP Account</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Role-Based Access Control registration with age and regional validation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Your Platform Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRole('participant')}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  role === 'participant'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-900">Participant (Young Person)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Aged 18–35. Enrolls in cohorts & submits projects.</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('mentor')}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  role === 'mentor'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-900">Mentor / Facilitator</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Schedules sessions & evaluates 1–5 rubrics.</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('partner')}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  role === 'partner'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-900">Employer / Partner</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Posts opportunities & reviews consented talent.</div>
              </button>
            </div>
          </div>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Chinwe Adisa"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Password with Strength Validation */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters with a number"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
              <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                {hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : '•'} 8+ Characters
              </span>
              <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                {hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : '•'} Number
              </span>
              <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                {hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : '•'} Special Symbol (optional)
              </span>
            </div>
          </div>

          {/* Participant Age Verification (Strict 18–35) */}
          {role === 'participant' && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-emerald-950 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Participant Age Verification (18–35)</span>
                </label>
                <span className="text-xs font-bold text-emerald-800">{age} years old</span>
              </div>
              <input
                type="range"
                min="16"
                max="40"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-emerald-800 mt-1">
                {age >= 18 && age <= 35
                  ? 'Eligible: Age meets the criteria set by the project blueprint (18 to 35).'
                  : 'Ineligible: Platform enrollment is restricted strictly to young people aged 18–35.'}
              </p>
            </div>
          )}

          {/* Regional Location */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Regional Location</label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="West Africa (Lagos, Nigeria)">West Africa (Lagos, Nigeria)</option>
              <option value="West Africa (Accra, Ghana)">West Africa (Accra, Ghana)</option>
              <option value="East Africa (Nairobi, Kenya)">East Africa (Nairobi, Kenya)</option>
              <option value="East Africa (Kigali, Rwanda)">East Africa (Kigali, Rwanda)</option>
              <option value="North Africa (Cairo, Egypt)">North Africa (Cairo, Egypt)</option>
              <option value="Southern Africa (Johannesburg, South Africa)">Southern Africa (Johannesburg, South Africa)</option>
              <option value="Global / Diaspora Community">Global / Diaspora Community</option>
            </select>
          </div>

          {/* Skills & Interests */}
          {role === 'participant' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Current Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Career Aspirations / Professional Goal
                </label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={e => setCareerGoal(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          {/* Short Bio */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Short Profile Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
            >
              Register & Enter Platform
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
