'use client';

import { useState, useEffect } from 'react';

import {
  User,
  ResourceLimit,
  UserResourceLimit,
  UsageLog,
  DashboardStats
} from '@/app/types/admin.types';

import {
  DEFAULT_RESOURCE_LIMITS,
  getTodayKey
} from '@/app/services/adminHelpers';

export const useAdminData = () => {

  const [users, setUsers] = useState<User[]>([]);

  const [resourceLimits, setResourceLimits] =
    useState<ResourceLimit[]>(DEFAULT_RESOURCE_LIMITS);

  const [userResourceLimits, setUserResourceLimits] =
    useState<UserResourceLimit[]>([]);

  const [usageLogs, setUsageLogs] =
    useState<UsageLog[]>([]);

  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats>({
      totalUsers: 0,
      activeUsersToday: 0,
      totalUsageToday: 0,
      topLocations: [],
      recentActivities: [],
    });

  // =========================
// LOAD USERS FROM FLASK
// =========================
useEffect(() => {

  const fetchUsers = async () => {

    try {

      const res = await fetch(
        'http://localhost:5000/users'
      );

      const data = await res.json();

      const formattedUsers = data.map(
        (u:any,index:number)=>({

          id:String(index+1),
          username:u.username,

          email:u.email || "",

          registeredAt:
            u.registeredAt || "",

          lastActive:
            u.lastActive || "",

          usageCount:
            u.usageCount || 0,

          location:
            u.location || "",

          isActive:true,

        }));

      setUsers(formattedUsers);

    } catch (err) {

      console.error(
        'Failed load users',
        err
      );

    }
  };

  fetchUsers();

}, []);
  // =========================
  // LOAD LOCAL DATA
  // =========================
  useEffect(() => {

    const storedLimits =
      localStorage.getItem(
        'ventara-resource-limits'
      );

    if (storedLimits) {
      setResourceLimits(
        JSON.parse(storedLimits)
      );
    }

    const storedUserLimits =
      localStorage.getItem(
        'ventara-user-resource-limits'
      );

    if (storedUserLimits) {
      setUserResourceLimits(
        JSON.parse(storedUserLimits)
      );
    }

    const storedLogs =
      localStorage.getItem(
        'ventara-usage-logs'
      );

    if (storedLogs) {

      setUsageLogs(
        JSON.parse(storedLogs)
      );

    }

  }, []);

  // =========================
  // DASHBOARD STATS
  // =========================
  useEffect(() => {

    const today = getTodayKey();

    const todayLogs =
      usageLogs.filter(log =>
        log.timestamp.startsWith(today)
      );

    const activeUsersToday =
      new Set(
        todayLogs.map(log => log.userId)
      ).size;

    const locationMap =
      new Map<string, number>();

    usageLogs.forEach(log => {

      locationMap.set(
        log.location,
        (locationMap.get(log.location) || 0) + 1
      );

    });

    const topLocations =
      Array.from(locationMap.entries())
        .map(([location, count]) => ({
          location,
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    setDashboardStats({
      totalUsers: users.length,
      activeUsersToday,
      totalUsageToday: todayLogs.length,
      topLocations,
      recentActivities:
        usageLogs.slice(-10).reverse(),
    });

  }, [users, usageLogs]);

const updateResourceLimit = (
  id: string,
  field: "dailyLimit" | "monthlyLimit",
  value: number
) => {

  const updated =
    resourceLimits.map(r => {

      if (r.id !== id)
        return r;

      return {

        ...r,

        dailyLimit:
          field === "dailyLimit"
            ? value
            : r.dailyLimit,

        monthlyLimit:
          field === "monthlyLimit"
            ? value
            : r.monthlyLimit,

      };

    });

  setResourceLimits(updated);

  localStorage.setItem(
    "ventara-resource-limits",
    JSON.stringify(updated)
  );

};

const updateUserResourceLimit = (
  userId: string,
  featureId: string,
  field: "daily" | "monthly",
  value: number
) => {

  const existing =
    userResourceLimits.find(
      x =>
        x.userId === userId &&
        x.id === featureId
    );

  const base =
    existing ??
    {
      ...resourceLimits.find(
        r => r.id === featureId
      )!,

      userId,

      username:
        users.find(
          u => u.id === userId
        )?.username || ""

    };

  const updatedItem = {

    ...base,

    dailyLimit:
      field === "daily"
        ? value
        : base.dailyLimit,

    monthlyLimit:
      field === "monthly"
        ? value
        : base.monthlyLimit,

  };

  const updated = [

    ...userResourceLimits.filter(
      x =>
        !(
          x.userId === userId &&
          x.id === featureId
        )
    ),

    updatedItem

  ];

  setUserResourceLimits(updated);

  localStorage.setItem(
    "ventara-user-resource-limits",
    JSON.stringify(updated)
  );

};

const getUserLimit = (
  userId: string,
  featureId: string
) => {

  const custom =
    userResourceLimits.find(
      x =>
        x.userId === userId &&
        x.id === featureId
    );

  if (custom) {

    return {

      dailyLimit:
        custom.dailyLimit,

      monthlyLimit:
        custom.monthlyLimit,

    };

  }

  const def =
    resourceLimits.find(
      x => x.id === featureId
    );

  return {

    dailyLimit:
      def?.dailyLimit ?? 0,

    monthlyLimit:
      def?.monthlyLimit ?? 0,

  };

};

const getUserUsageToday = (
  userId: string
) => {

  const today = getTodayKey();

  return usageLogs.filter(
    log =>
      log.userId === userId &&
      log.timestamp.startsWith(today)
  ).length;

};

const deleteUser = (
  userId: string
) => {

  setUsers(prev =>
    prev.filter(
      u => u.id !== userId
    )
  );

};

const activateUser = (
  userId: string,
  active: boolean = true
) => {

  setUsers(prev =>
    prev.map(u =>
      u.id === userId
        ? {
            ...u,
            isActive: active,
          }
        : u
    )
  );

};

  return {
  users,
  setUsers,

  resourceLimits,
  userResourceLimits,

  usageLogs,
  dashboardStats,

  updateResourceLimit,
  updateUserResourceLimit,

  getUserLimit,
  getUserUsageToday,

  deleteUser,
  activateUser,
};
};