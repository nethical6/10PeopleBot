const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

export class DatabaseService {
    private supabase: ReturnType<typeof createClient>;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL as string,
            process.env.SUPABASE_ANON_KEY as string
        );
    }

    // User Interests Management
    async saveUserInterests(userId: string, interests: string[]): Promise<boolean> {
        const { error } = await this.supabase
            .from('user_interests')
            .upsert({ 
                user_id: userId, 
                interests: interests,
                updated_at: new Date().toISOString()
            });

        if (error) console.error(`Error saving user interests for ${userId}:`, error);
        return !error;
    }

    async getUserInterests(userId: string): Promise<string[] | null> {
        const { data, error } = await this.supabase
            .from('user_interests')
            .select('interests')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error(`Error getting user interests for ${userId}:`, error);
            return null;
        }
        return data?.interests ?? null;
    }

    // Group Management
    async createGroup(groupId: string, members: string[]): Promise<boolean> {
        const { error } = await this.supabase
            .from('groups')
            .insert({
                group_id: groupId,
                members: members,
                created_at: new Date().toISOString(),
                is_full: false
            });

        if (error) console.error('Error creating group:', error);
        return !error;
    }

    async updateGroupMembers(groupId: string, members: string[]): Promise<boolean> {
        const { error } = await this.supabase
            .from('groups')
            .update({ 
                members: members,
                updated_at: new Date().toISOString(),
                is_full: members.length >= 10 
            })
            .eq('group_id', groupId);

        if (error) console.error('Error updating group members:', error);
        return !error;
    }

    // Get all groups which require matching
    async getActiveGroups(): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('groups')
            .select('*')
            .eq('is_full', false);

        if (error) {
            console.error('Error getting active groups:', error);
            return [];
        }
        return data || [];
    }

    async deleteGroup(groupId: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('groups')
            .delete()
            .eq('group_id', groupId);

        if (error) console.error('Error deleting group:', error);
        return !error;
    }

    // Waiting Pool Management
    async addToWaitingPool(userId: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('waiting_pool')
            .upsert({
                user_id: userId,
                joined_at: new Date().toISOString()
            });

        if (error) console.error('Error adding to waiting pool:', error);
        return !error;
    }
    

    async removeFromWaitingPool(userId: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('waiting_pool')
            .delete()
            .eq('user_id', userId);

        if (error) console.error('Error removing from waiting pool:', error);
        return !error;
    }

    async getWaitingPool(): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('waiting_pool')
            .select('user_id')
            .order('joined_at', { ascending: true });

        if (error) {
            console.error('Error getting waiting pool:', error);
            return [];
        }
        return data?.map((entry: { user_id: string }) => entry.user_id) || [];
    }
}

