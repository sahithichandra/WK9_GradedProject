import mongoose from 'mongoose';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Tag from '../models/Tag.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { tags, users, questions, answers } from './seed-data.js';

dotenv.config();

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Clear all existing data
async function clearExistingData() {
  try {
    await Promise.all([
      User.deleteMany({}),
      Question.deleteMany({}),
      Answer.deleteMany({}),
      Tag.deleteMany({}),
    ]);
    console.log('Deleted existing data');
  } catch (error) {
    console.error('Error clearing existing data:', error);
    throw error;
  } 
}

// Create tags in the database
async function createTags(tags) {
  try {
    const createdTags = await Tag.insertMany(tags);
    console.log(`Created ${createdTags.length} tags`);
    return createdTags;
  } catch (error) {
    console.error('Error creating tags:', error);
    throw error;
  }
}

// Create users in the database
async function createUsers(users) {
  try {
    const hashedUsers = await Promise.all(users.map(async user => ({
      ...user,
      password: await bcrypt.hash(user.password, 10)
    })));
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
}

// Create questions in the database
async function createQuestions(questions) {
  try {
    const completedQuestions = questions.map(q => ({
      ...q,
      voteCount: q.upvotes.length - q.downvotes.length,
    }));
    const createdQuestions = await Question.insertMany(completedQuestions);
    console.log(`Created ${createdQuestions.length} questions`);
    return createdQuestions;
  } catch (error) {
    console.error('Error creating questions:', error);
    throw error;
  }
}

// Create answers in the database
async function createAnswers(answers) {
  try {
    const completedAnswers = answers.map(a => ({
      ...a,
      voteCount: a.upvotes.length - a.downvotes.length,
    }));
    const createdAnswers = await Answer.insertMany(completedAnswers);
    console.log(`Created ${createdAnswers.length} answers`);
    return createdAnswers;
  } catch (error) {
    console.error('Error creating answers:', error);
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    await connectToDatabase();
    await clearExistingData();
    
    await createTags(tags);
    await createUsers(users);
    await createQuestions(questions);
    await createAnswers(answers);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();