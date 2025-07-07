'use client';
import React from 'react';

export default function AuthForm({
  userId, userPw, setUserId, setUserPw,
  loginError, adminModeActive, setAdminModeActive,
  handleLogin,
  newUserId, newUserPw, setNewUserId, setNewUserPw,
  userAddError, handleAddUser
}: any) {
  return (
    <div className="max-w-md mx-auto mt-20">{/* 로그인/회원가입 UI */}</div>
  );
}
