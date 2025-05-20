import mongoose, { Schema, Document, Types } from 'mongoose';

// Enums
export enum CallOutcome {
  ANSWERED = 'ANSWERED',
  WENT_TO_VOICEMAIL = 'WENT_TO_VOICEMAIL',
  NO_ANSWER = 'NO_ANSWER',
  CALL_DROPPED = 'CALL_DROPPED',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  WRONG_NUMBER = 'WRONG_NUMBER'
}

export enum LeadStatus {
  HIGH_POTENTIAL = 'HIGH_POTENTIAL',
  WARM_LEAD = 'WARM_LEAD',
  COLD_LEAD = 'COLD_LEAD',
  NOT_A_FIT = 'NOT_A_FIT',
  USING_COMPETITOR = 'USING_COMPETITOR'
}

// Interfaces
export interface IFeedback extends Document {
  callOutcome: CallOutcome;
  leadStatus?: LeadStatus;
  notes?: string;
  callId: string;
  createdAt: Date;
}

export interface ICall extends Document {
  _id: string;
  from: string;
  to: string;
  status: string;
  duration?: number;
  recordingUrl?: string;
  notes?: string;
  script?: string;
  createdAt: Date;
  updatedAt: Date;
  sessionId?: string;
  sequenceIndex?: number;
  feedback: IFeedback[];
  campaignId: Types.ObjectId;
  salesRepId: string;
}

export interface ICallSession extends Document {
  phoneNumbers: string[];
  currentIndex: number;
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  calls: ICall[];
}

// Schemas
const FeedbackSchema = new Schema({
  callOutcome: {
    type: String,
    enum: Object.values(CallOutcome),
    required: true
  },
  leadStatus: {
    type: String,
    enum: Object.values(LeadStatus)
  },
  notes: String,
  callId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CallSchema = new Schema({
  _id: String,
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  duration: Number,
  recordingUrl: String,
  notes: String,
  script: String,
  sessionId: String,
  sequenceIndex: {
    type: Number,
    default: 0
  },
  feedback: [FeedbackSchema],
  campaignId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Campaign'
  },
  salesRepId: {
    type: String,
    required: true,
    ref: 'SalesRep'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const CallSessionSchema = new Schema({
  phoneNumbers: [{
    type: String,
    required: true
  }],
  currentIndex: {
    type: Number,
    default: 0
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Models
export const Call = mongoose.model<ICall>('Call', CallSchema);
export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
export const CallSession = mongoose.model<ICallSession>('CallSession', CallSessionSchema);