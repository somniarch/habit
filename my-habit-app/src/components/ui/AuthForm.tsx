'use client';
import React from 'react';

type AuthFormProps = {
  userId: string;
  userPw: string;
  setUserId: (val: string) => void;
  setUserPw: (val: string) => void;
  loginError: string;
  adminModeActive: boolean;
  setAdminModeActive: (val: boolean) => void;
  handleLogin: () => void;
  newUserId: string;
  newUserPw: string;
  setNewUserId: (val: string) => void;
  setNewUserPw: (val: string) => void;
  userAddError: string;
  handleAddUser: () => void;
};

export default function AuthForm({
  userId, userPw, setUserId, setUserPw,
  loginError, adminModeActive, setAdminModeActive,
  handleLogin,
  newUserId, newUserPw, setNewUserId, setNewUserPw,
  userAddError, handleAddUser
}: AuthFormProps) {
  return (
    <div className="max-w-sm mx-auto p-6 mt-20 border rounded shadow space-y-4 font-sans">
      <h2 className="text-xl font-semibold text-center">로그인 해주세요</h2>

      <input
        type="text"
        placeholder="아이디"
        value={userId}
        onChange={e => setUserId(e.target.value)}
        className="border rounded px-3 py-2 w-full"
      />

      <input
        type="password"
        placeholder="비밀번호"
        value={userPw}
        onChange={e => setUserPw(e.target.value)}
        className="border rounded px-3 py-2 w-full"
      />

      <div className="flex justify-between items-center mt-1">
        <button
          onClick={() => {
            setAdminModeActive(!adminModeActive);
            setUserId("");
            setUserPw("");
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          {adminModeActive ? "일반 로그인 모드로 전환" : "관리자 모드"}
        </button>

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          로그인
        </button>
      </div>

      {loginError && <p className="text-red-600">{loginError}</p>}

      {adminModeActive && (
        <div className="mt-4 border rounded p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">사용자 등록 (관리자 전용)</h3>

          <input
            type="text"
            placeholder="새 사용자 아이디"
            value={newUserId}
            onChange={e => setNewUserId(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-2"
          />

          <input
            type="password"
            placeholder="새 사용자 비밀번호"
            value={newUserPw}
            onChange={e => setNewUserPw(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-2"
          />

          {userAddError && <p className="text-red-600 mb-2">{userAddError}</p>}

          <button
            onClick={handleAddUser}
            className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
          >
            사용자 등록
          </button>
        </div>
      )}
    </div>
  );
}
