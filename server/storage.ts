import {
  users,
  partners,
  projects,
  tickets,
  notifications,
  referrals,
  payments,
  type User,
  type InsertUser,
  type Partner,
  type InsertPartner,
  type Project,
  type InsertProject,
  type Ticket,
  type InsertTicket,
  type Notification,
  type InsertNotification,
  type Referral,
  type InsertReferral,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Partner operations
  getPartner(userId: number): Promise<Partner | undefined>;
  getPartnerByReferralCode(code: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, updates: Partial<Partner>): Promise<Partner>;
  getPartnerStats(partnerId: number): Promise<any>;
  
  // Project operations
  getProjects(userId: number, role: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;
  
  // Referral operations
  getReferrals(partnerId: number): Promise<any[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  
  // Ticket operations
  getTickets(userId: number): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<Payment>): Promise<Payment>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAdminStats(): Promise<any>;
  
  // Seed data
  seedUsers(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getPartner(userId: number): Promise<Partner | undefined> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.userId, userId));
    return partner;
  }

  async getPartnerByReferralCode(code: string): Promise<Partner | undefined> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.referralCode, code));
    return partner;
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const [partner] = await db
      .insert(partners)
      .values(insertPartner)
      .returning();
    return partner;
  }

  async updatePartner(id: number, updates: Partial<Partner>): Promise<Partner> {
    const [partner] = await db
      .update(partners)
      .set(updates)
      .where(eq(partners.id, id))
      .returning();
    return partner;
  }

  async getPartnerStats(partnerId: number): Promise<any> {
    const [stats] = await db
      .select({
        totalEarnings: partners.totalEarnings,
        activeReferrals: sql<number>`COUNT(DISTINCT ${referrals.id})`,
        closedSales: sql<number>`COUNT(DISTINCT CASE WHEN ${referrals.status} = 'paid' THEN ${referrals.id} END)`,
      })
      .from(partners)
      .leftJoin(referrals, eq(partners.id, referrals.partnerId))
      .where(eq(partners.id, partnerId))
      .groupBy(partners.id);

    return {
      totalEarnings: stats?.totalEarnings || "0.00",
      activeReferrals: stats?.activeReferrals || 0,
      closedSales: stats?.closedSales || 0,
      conversionRate: stats?.activeReferrals > 0 
        ? Math.round((stats.closedSales / stats.activeReferrals) * 100) 
        : 0,
    };
  }

  async getProjects(userId: number, role: string): Promise<Project[]> {
    const query = db.select().from(projects);
    
    if (role === "client") {
      return await query.where(eq(projects.clientId, userId)).orderBy(desc(projects.createdAt));
    } else if (role === "partner") {
      const partner = await this.getPartner(userId);
      if (!partner) return [];
      return await query.where(eq(projects.partnerId, partner.id)).orderBy(desc(projects.createdAt));
    } else if (role === "admin") {
      return await query.orderBy(desc(projects.createdAt));
    }
    
    return [];
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async getReferrals(partnerId: number): Promise<any[]> {
    return await db
      .select({
        id: referrals.id,
        status: referrals.status,
        commissionAmount: referrals.commissionAmount,
        createdAt: referrals.createdAt,
        clientName: users.fullName,
        clientEmail: users.email,
        projectName: projects.name,
        projectPrice: projects.price,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.clientId, users.id))
      .leftJoin(projects, eq(referrals.projectId, projects.id))
      .where(eq(referrals.partnerId, partnerId))
      .orderBy(desc(referrals.createdAt));
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values(insertReferral)
      .returning();
    return referral;
  }

  async getTickets(userId: number): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .where(eq(tickets.userId, userId))
      .orderBy(desc(tickets.createdAt));
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const [ticket] = await db
      .insert(tickets)
      .values(insertTicket)
      .returning();
    return ticket;
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getAdminStats(): Promise<any> {
    const [stats] = await db
      .select({
        totalUsers: sql<number>`COUNT(DISTINCT ${users.id})`,
        activePartners: sql<number>`COUNT(DISTINCT CASE WHEN ${partners.id} IS NOT NULL THEN ${partners.id} END)`,
        activeProjects: sql<number>`COUNT(DISTINCT CASE WHEN ${projects.status} IN ('pending', 'in_progress') THEN ${projects.id} END)`,
        monthlyRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${projects.status} = 'completed' AND ${projects.createdAt} >= date_trunc('month', CURRENT_DATE) THEN ${projects.price} END), 0)`,
      })
      .from(users)
      .leftJoin(partners, eq(users.id, partners.userId))
      .leftJoin(projects, eq(users.id, projects.clientId));

    return {
      totalUsers: stats?.totalUsers || 0,
      activePartners: stats?.activePartners || 0,
      activeProjects: stats?.activeProjects || 0,
      monthlyRevenue: `$${stats?.monthlyRevenue || "0"}`,
    };
  }

  async seedUsers(): Promise<void> {
    const bcrypt = await import("bcryptjs");
    
    const seedUsers = [
      {
        email: "admin@softwarepar.lat",
        password: await bcrypt.hash("admin123", 10),
        fullName: "Administrador SoftwarePar",
        role: "admin" as const,
      },
      {
        email: "cliente@test.com",
        password: await bcrypt.hash("cliente123", 10),
        fullName: "Cliente Test",
        role: "client" as const,
      },
      {
        email: "partner@test.com",
        password: await bcrypt.hash("partner123", 10),
        fullName: "Partner Test",
        role: "partner" as const,
      },
    ];

    for (const userData of seedUsers) {
      const existingUser = await this.getUserByEmail(userData.email);
      if (!existingUser) {
        const user = await this.createUser(userData);
        
        // Create partner for partner user
        if (userData.role === "partner") {
          await this.createPartner({
            userId: user.id,
            referralCode: "ABC123",
            commissionRate: "25.00",
            totalEarnings: "0.00",
          });
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
