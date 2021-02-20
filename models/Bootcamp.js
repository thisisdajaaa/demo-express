const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');
const {
  BOOTCAMP_NAME_REQ_VALIDATION,
  BOOTCAMP_NAME_MAXLN_VALIDATION,
  BOOTCAMP_DESCRIPTION_REQ_VALIDATION,
  BOOTCAMP_DESCRIPTION_MAXLN_VALIDATION,
  BOOTCAMP_PHONE_MAXLN_VALIDATION,
  BOOTCAMP_EMAIL_MATCH_VALIDATION,
  BOOTCAMP_ADDRESS_REQ_VALIDATION,
  BOOTCAMP_AVG_RATING_MIN_VALIDATION,
  BOOTCAMP_AVG_RATING_MAX_VALIDATION,
  BOOTCAMP_WEBSITE_MATCH_VALIDATION,
} = require('../utils/constants');

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, BOOTCAMP_NAME_REQ_VALIDATION],
      unique: true,
      trim: true,
      maxlength: [50, BOOTCAMP_NAME_MAXLN_VALIDATION],
    },
    slug: String,
    description: {
      type: String,
      required: [true, BOOTCAMP_DESCRIPTION_REQ_VALIDATION],
      maxlength: [500, BOOTCAMP_DESCRIPTION_MAXLN_VALIDATION],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        BOOTCAMP_WEBSITE_MATCH_VALIDATION,
      ],
    },
    phone: {
      type: String,
      maxlength: [20, BOOTCAMP_PHONE_MAXLN_VALIDATION],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        BOOTCAMP_EMAIL_MATCH_VALIDATION,
      ],
    },
    address: {
      type: String,
      required: [true, BOOTCAMP_ADDRESS_REQ_VALIDATION],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRating: {
      type: Number,
      min: [1, BOOTCAMP_AVG_RATING_MIN_VALIDATION],
      max: [10, BOOTCAMP_AVG_RATING_MAX_VALIDATION],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

BootcampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  this.address = undefined;
  next();
});

BootcampSchema.pre('remove', async function (next) {
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
