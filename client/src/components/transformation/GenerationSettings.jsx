import React from 'react';
import { SETTINGS_OPTIONS } from '../../utils/constants.js';

export const GenerationSettings = ({
  settings,
  setSettings,
  disabled = false,
}) => {
  const handleChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Audience & Style Parameters
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Target Audience */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Target Audience
          </label>
          <select
            value={settings.targetAudience}
            onChange={(e) => handleChange('targetAudience', e.target.value)}
            disabled={disabled}
            className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-input focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {SETTINGS_OPTIONS.targetAudience.map((aud) => (
              <option key={aud} value={aud}>
                {aud}
              </option>
            ))}
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Tone of Voice
          </label>
          <select
            value={settings.tone}
            onChange={(e) => handleChange('tone', e.target.value)}
            disabled={disabled}
            className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-input focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {SETTINGS_OPTIONS.tone.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Communication Objective */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Communication Objective
          </label>
          <select
            value={settings.communicationObjective}
            onChange={(e) => handleChange('communicationObjective', e.target.value)}
            disabled={disabled}
            className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-input focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {SETTINGS_OPTIONS.communicationObjective.map((obj) => (
              <option key={obj} value={obj}>
                {obj}
              </option>
            ))}
          </select>
        </div>

        {/* Level of Detail */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Level of Detail
          </label>
          <select
            value={settings.levelOfDetail}
            onChange={(e) => handleChange('levelOfDetail', e.target.value)}
            disabled={disabled}
            className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-input focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {SETTINGS_OPTIONS.levelOfDetail.map((lod) => (
              <option key={lod} value={lod}>
                {lod}
              </option>
            ))}
          </select>
        </div>

        {/* Content Style */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Content Style
          </label>
          <select
            value={settings.contentStyle}
            onChange={(e) => handleChange('contentStyle', e.target.value)}
            disabled={disabled}
            className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-input focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {SETTINGS_OPTIONS.contentStyle.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
            disabled={disabled}
            className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-input focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {SETTINGS_OPTIONS.language.map((lang) => (
              <option key={lang.value} value={lang.value} disabled={!lang.available}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
