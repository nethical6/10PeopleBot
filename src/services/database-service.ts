import { GuildMember } from "discord.js";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Json,
} from "../types/supabase";
require("dotenv").config();

export class DatabaseService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string
    );
  }

  async saveUserInterests(
    userId: string,
    interests: string[]
  ): Promise<boolean> {

    const { error } = await this.supabase.from("user").upsert({
      user_id: userId,
      interests: interests as Json,
    } satisfies TablesInsert<"user">);

    if (error)
      console.error(`Error saving user interests for ${userId}:`, error);
    return !error;
  }

  async getUserInterests(userId: string): Promise<string[] | null> {
    const { data, error } = await this.supabase
      .from("user")
      .select("interests")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error(`Error getting user interests for ${userId}:`, error);
      return null;
    }
    return (data?.interests as string[]) ?? null;
  }

  async addUserToGroup(userId:string,group:string): Promise<Boolean>{
    const result = await this.updateUserProfile(userId,{
      joined_group:group
    })
    await this.checkAndSetGroupFull(group)
    return result;
  }

  async createGroup(groupId: string, members: string[]): Promise<boolean> {
    const { error } = await this.supabase.from("groups").insert({
      group_id: groupId,
      created_at: new Date().toISOString(),
      is_full: false,
    } satisfies TablesInsert<"groups">);

    for (const member of members){
      await this.updateUserProfile(member,{joined_group:groupId})
    }
    if (error) console.error("Error creating group:", error);
    return !error;
  }

  async getAllGroupMembers(group_id: string): Promise<string[] | null> {
    const { data: users, error: membersError } = await this.supabase
      .from("user")
      .select("user_id")
      .eq("joined_group", group_id);

    if (membersError) {
      console.error(`Error getting members for group ${group_id}:`, membersError);
      return null;
    }
    return users?.map((user: { user_id: string }) => user.user_id) ?? [];
  }

  async setGroupFull(
    groupId: string,
    is_full:boolean
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from("groups")
      .update({
        is_full: is_full,
      } satisfies TablesUpdate<"groups">)
      .eq("group_id", groupId);


    if (error) console.error("Error updating group members:", error);
    return !error;
  }
  async checkAndSetGroupFull(group_id:string): Promise<void>{
    const members = await this.getAllGroupMembers(group_id)
    if(members===null) return 
    await this.setGroupFull(group_id,members?.length>=10)
  }

  async updateUserProfile(
    userId: string,
    data: Partial<TablesUpdate<"user">>
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from("user")
      .update(data)
      .eq("user_id", userId);

    if (error) console.error(`Error updating user ${userId}'s info: `, error);
    return !error;
  }

  async getJoinedGroupId(userId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("user")
      .select("joined_group")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error(`Error getting joined group for ${userId}:`, error);
      return null;
    }
    return data?.joined_group ?? null;
  }

  // Get all groups which require matching
  async getActiveGroups(): Promise<Tables<"groups">[]> {
    const { data, error } = await this.supabase
      .from("groups")
      .select("*")
      .eq("is_full", false);

    if (error) {
      console.error("Error getting active groups:", error);
      return [];
    }
    return data || [];
  }

  /**
   * Retrieves a specific group by its ID
   * @param groupId The ID of the group to retrieve
   * @returns Promise<Tables<'groups'> | null> The group data or null if not found
   */
  async getGroupById(groupId: string): Promise<Tables<"groups"> | null> {
    const { data, error } = await this.supabase
      .from("groups")
      .select()
      .eq("group_id", groupId)
      .single();
    if (error) {
      console.error(`Error getting group by ID ${groupId}:`, error);
      return null;
    }
    return data || null;
  }

  async deleteGroup(groupId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("groups")
      .delete()
      .eq("group_id", groupId);

    if (error) console.error("Error deleting group:", error);
    return !error;
  }

  // Waiting Pool Management
  async addToWaitingPool(userId: string): Promise<boolean> {
    const { error } = await this.supabase.from("waiting_pool").upsert({
      user_id: userId,
      joined_at: new Date().toISOString(),
    } satisfies TablesInsert<"waiting_pool">);

    if (error) console.error("Error adding to waiting pool:", error);
    return !error;
  }

  async removeFromWaitingPool(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("waiting_pool")
      .delete()
      .eq("user_id", userId);

    if (error) console.error("Error removing from waiting pool:", error);
    return !error;
  }

  async getWaitingPool(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("waiting_pool")
      .select()
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Error getting waiting pool:", error);
      return [];
    }
    return data?.map((entry: Tables<"waiting_pool">) => entry.user_id) || [];
  }

  async getKickedGroups(user_id: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("user")
      .select("kicked_groups")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error(`Error getting kicked groups for user ${user_id}:`, error);
      return [];
    }
    return (data?.kicked_groups as string[]) ?? [];
  }

  async removeMemberFromGroup(member: GuildMember): Promise<string | null> {
    const groupId = await this.getJoinedGroupId(member.id);
    if (groupId === null) return null;
    
    const kickedGroups = await this.getKickedGroups(member.id)
    kickedGroups.push(groupId)
    await this.updateUserProfile(member.id, { joined_group: null,kicked_groups:kickedGroups });

    await this.setGroupFull(groupId, false);
    return groupId;
  }

  async checkIfUserIsFromGroup(group: string, user_id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("user")
      .select("user_id")
      .eq("user_id", user_id)
      .eq("joined_group", group)
      .single();

    if (error) {
      console.error(`Error checking if user ${user_id} is from group ${group}:`, error);
      return false;
    }
    return !!data;
  }
}
