import mongoose from 'mongoose';

/**
 * Database connection utility
 */
export class DBConnection {
  private static instance: DBConnection;
  private _isConnected: boolean = false;

  private constructor() {}

  static getInstance(): DBConnection {
    if (!DBConnection.instance) {
      DBConnection.instance = new DBConnection();
    }
    return DBConnection.instance;
  }

  /**
   * Connect to MongoDB
   * @param uri MongoDB connection URI (defaults to the URI from .env file if not provided)
   */
  async connect(uri?: string): Promise<void> {
    try {
      if (this._isConnected) {
        console.log('MongoDB already connected');
        return;
      }
      
      // Use provided URI or fall back to environment variable or default value
      const connectionUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-rest-app';
      
      await mongoose.connect(connectionUri);
      this._isConnected = true;
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this._isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
    }
  }

  /**
   * Check if connected to MongoDB
   */
  get isConnected(): boolean {
    return this._isConnected;
  }
}

export default DBConnection.getInstance();
