import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  async function fetchProfile() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) setProfile(data);
    setLoading(false);
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...updates }, { onConflict: "id" })
      .select()
      .single();

    if (!error && data) setProfile(data);
    return { data, error };
  }

  return { profile, loading, updateProfile, refetch: fetchProfile };
}

export function useSpending(userId) {
  const [spending, setSpending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchSpending();
  }, [userId]);

  async function fetchSpending() {
    setLoading(true);
    const { data, error } = await supabase
      .from("spending")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (!error && data) setSpending(data);
    setLoading(false);
  }

  async function addSpending(entry) {
    const { data, error } = await supabase
      .from("spending")
      .insert({ ...entry, user_id: userId })
      .select()
      .single();

    if (!error && data) setSpending(prev => [data, ...prev]);
    return { data, error };
  }

  async function deleteSpending(id) {
    const { error } = await supabase.from("spending").delete().eq("id", id);
    if (!error) setSpending(prev => prev.filter(s => s.id !== id));
    return { error };
  }

  const totalThisMonth = spending
    .filter(s => new Date(s.date).getMonth() === new Date().getMonth())
    .reduce((sum, s) => sum + Number(s.amount), 0);

  return { spending, loading, addSpending, deleteSpending, totalThisMonth, refetch: fetchSpending };
}

export function useGoals(userId) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchGoals();
  }, [userId]);

  async function fetchGoals() {
    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!error && data) setGoals(data);
    setLoading(false);
  }

  async function addGoal(goal) {
    const { data, error } = await supabase
      .from("goals")
      .insert({ ...goal, user_id: userId })
      .select()
      .single();

    if (!error && data) setGoals(prev => [...prev, data]);
    return { data, error };
  }

  async function updateGoal(id, updates) {
    const { data, error } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) setGoals(prev => prev.map(g => g.id === id ? data : g));
    return { data, error };
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (!error) setGoals(prev => prev.filter(g => g.id !== id));
    return { error };
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal, refetch: fetchGoals };
}

export function useGiving(userId) {
  const [giving, setGiving] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchGiving();
  }, [userId]);

  async function fetchGiving() {
    setLoading(true);
    const { data, error } = await supabase
      .from("giving")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (!error && data) setGiving(data);
    setLoading(false);
  }

  async function addGiving(entry) {
    const { data, error } = await supabase
      .from("giving")
      .insert({ ...entry, user_id: userId })
      .select()
      .single();

    if (!error && data) setGiving(prev => [data, ...prev]);
    return { data, error };
  }

  const totalThisMonth = giving
    .filter(g => new Date(g.date).getMonth() === new Date().getMonth())
    .reduce((sum, g) => sum + Number(g.amount), 0);

  const totalYTD = giving
    .filter(g => new Date(g.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, g) => sum + Number(g.amount), 0);

  return { giving, loading, addGiving, totalThisMonth, totalYTD, refetch: fetchGiving };
}
