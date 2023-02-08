const mongoose = require('mongoose');

const { CmiTrack } = require('../../models');

const get = (req, res) => {
  const filter = {
    user: mongoose.Types.ObjectId(req.user.student_id),
    attempt: 1,
    element: { $in: ['cmi.core.lesson_status', 'cmi.core.score.raw', 'cmi.core.total_time'] },
  };

  CmiTrack.find(filter)
    .populate('aicccontent')
    .lean()
    .transform((data) => {
      // data is the results array so map it
      if (data == null) return [];

      const transformed = data.reduce((accumulator, currentValue) => {
        const { code, type, title } = currentValue.aicccontent;
        const { element, value } = currentValue;

        const mapped = {
          'cmi.core.lesson_status': 'status',
          'cmi.core.score.raw': 'score',
          'cmi.core.total_time': 'duration',
        };

        const newObj = {
          code,
          type,
          title,
          [mapped[element]]: value,
        };

        const hasItem = accumulator.find((item, index) => {
          if (item.code === code) {
            accumulator[index] = { ...accumulator[index], ...newObj };
            return true;
          }
          return false;
        });

        if (!hasItem) {
          return [...accumulator, newObj];
        }
        return accumulator;
      }, []);
      return transformed;
    })
    .then((items) => {
      res.render('results', { user: req.user, items });
    });
};

module.exports = { get };
