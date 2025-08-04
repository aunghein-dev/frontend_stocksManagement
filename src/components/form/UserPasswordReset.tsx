import { useTranslation } from '@/hooks/useTranslation';
import { CheckCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; 
import { useState } from 'react';
import axios from 'axios';
import { UserProfile } from '@/app/settings/profile/page';
import { toast } from 'react-hot-toast';

interface Props {
  userProfile: UserProfile;
}

export default function UserPasswordReset({ userProfile }: Props) {
  
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleReset = async () => {
      if (!userProfile?.id || !API_BASE_URL) return;
      if (newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }

      try {
        setIsResettingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(false);

        
        const formData = new FormData();
        formData.append("newPassword", newPassword);

        await axios.put(`${API_BASE_URL}/auth/reset/password/${userProfile.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });

      
        toast.success("Password updated successfully!");
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
      } catch (err) {
        console.error(err);
        toast.error("Failed to update password.");
        setPasswordError("An error occurred while changing the password.");
      } finally {
        setIsResettingPassword(false);
      }
  }

  return (
    <div>
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("hd_passwordSettings")}</h2>
        <p className="text-sm text-gray-600 mb-6">{t("msg_passwordInstruction")}</p>

        <div className="flex flex-col gap-6 mb-6 max-w-sm">
          {/* New Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t("ph_newPassword")}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
              className="w-full text-sm p-2 pr-10 rounded-xs h-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t("ph_confirmPassword")}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
              className="w-full text-sm p-2 pr-10 rounded-xs h-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={isResettingPassword || !newPassword || !confirmPassword}
          className={`px-3 py-2 bg-yellow-500 text-white rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200 text-sm ${
            isResettingPassword ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isResettingPassword ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
              {t("btn_updating")}
            </>
          ) : (
            t("btn_resetPassword")
          )}
        </button>

        {/* Feedback messages */}
        {passwordError && (
          <p className="mt-4 text-sm text-red-600">{passwordError}</p>
        )}
        {passwordSuccess && (
          <p className="mt-4 text-sm text-green-600">
            <CheckCircleIcon className="inline w-5 h-5 mr-1" /> {t("msg_passwordChanged")}
          </p>
        )}
      </div>

    </div>
  );
}