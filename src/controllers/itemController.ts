import { Request, Response } from 'express';
import { Item } from '../models/Item';
import { AuthenticatedRequest } from '../types';
import { Types } from 'mongoose';

// @desc    Get all items with search, filter, sort, pagination
// @route   GET /api/items
// @access  Public
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = '1',
      limit = '8',
    } = req.query;

    // Build query object
    const query: any = {};

    // Search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDesc: { $regex: search, $options: 'i' } },
        { fullDesc: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (category && category !== 'All') {
      query.category = category;
    }

    if (location && location !== 'All') {
      query.location = { $regex: location as string, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Count total matched records before pagination
    const totalItems = await Item.countDocuments(query);

    // Sorting
    let sortQuery: any = { createdAt: -1 }; // default: newest first
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortQuery = { price: 1 };
          break;
        case 'price_desc':
          sortQuery = { price: -1 };
          break;
        case 'date_asc':
          sortQuery = { date: 1 };
          break;
        case 'date_desc':
          sortQuery = { date: -1 };
          break;
        case 'rating_desc':
          sortQuery = { rating: -1 };
          break;
        default:
          sortQuery = { createdAt: -1 };
      }
    }

    // Pagination
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number(limit) > 0 ? Number(limit) : 8;
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch listings
    const items = await Item.find(query)
      .sort(sortQuery)
      .skip(skipNum)
      .limit(limitNum)
      .populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: items.length,
      pagination: {
        total: totalItems,
        page: pageNum,
        pages: Math.ceil(totalItems / limitNum),
        limit: limitNum,
      },
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Get single item details
// @route   GET /api/items/:id
// @access  Public
export const getItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name email');
    if (!item) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }

    // Find related items (same category, excluding current one, limit to 4)
    const relatedItems = await Item.find({
      category: item.category,
      _id: { $ne: item._id },
    }).limit(4);

    res.status(200).json({
      success: true,
      data: item,
      related: relatedItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing detail',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Create a new item listing
// @route   POST /api/items
// @access  Private
export const createItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      shortDesc,
      fullDesc,
      price,
      date,
      imageUrl,
      category,
      location,
      specifications,
    } = req.body;

    if (!title || !shortDesc || !fullDesc || price === undefined || !imageUrl || !category || !location) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized, user missing' });
      return;
    }

    const item = await Item.create({
      title,
      shortDesc,
      fullDesc,
      price: Number(price),
      date: date ? new Date(date) : new Date(),
      imageUrl,
      category,
      location,
      owner: new Types.ObjectId(req.user.id),
      specifications: specifications || {},
      rating: 5, // Default rating for new items
      reviews: [],
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Get items owned by the logged-in user
// @route   GET /api/items/user/manage
// @access  Private
export const getUserItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const items = await Item.find({ owner: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your listings',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Delete an item listing
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }

    // Verify ownership
    if (item.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
      return;
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Listing successfully deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete listing',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Add review to an item
// @route   POST /api/items/:id/reviews
// @access  Public (or verified but we can keep it open or require name)
export const addReviewToItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName, rating, comment } = req.body;

    if (!userName || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Please provide reviewer name, rating and comment' });
      return;
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }

    const newReview = {
      userName,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    item.reviews.push(newReview);

    // Recalculate average rating
    const totalRating = item.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    item.rating = Number((totalRating / item.reviews.length).toFixed(1));

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
