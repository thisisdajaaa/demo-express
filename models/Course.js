const mongoose = require('mongoose');
const {
  COURSE_TITLE_REQ_VALIDATION,
  COURSE_DESCRIPTION_REQ_VALIDATION,
  COURSE_MIN_SKILL_REQ_VALIDATION,
  COURSE_TUITION_REQ_VALIDATION,
  COURSE_WEEKS_REQ_VALIDATION,
} = require('../utils/constants');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, COURSE_TITLE_REQ_VALIDATION],
  },
  description: {
    type: String,
    required: [true, COURSE_DESCRIPTION_REQ_VALIDATION],
  },
  weeks: {
    type: String,
    required: [true, COURSE_WEEKS_REQ_VALIDATION],
  },
  tuition: {
    type: Number,
    required: [true, COURSE_TUITION_REQ_VALIDATION],
  },
  minimumSkill: {
    type: String,
    required: [true, COURSE_MIN_SKILL_REQ_VALIDATION],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (error) {
    console.log(error);
  }
};

CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
