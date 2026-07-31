import { Request } from 'express';
import { Types } from 'mongoose';

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReview {
  _id?: Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IItem {
  _id?: Types.ObjectId;
  title: string;
  shortDesc: string;
  fullDesc: string;
  price: number;
  date: Date;
  imageUrl: string;
  category: string;
  location: string;
  rating: number;
  reviews: IReview[];
  owner: Types.ObjectId | IUser;
  specifications: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}
