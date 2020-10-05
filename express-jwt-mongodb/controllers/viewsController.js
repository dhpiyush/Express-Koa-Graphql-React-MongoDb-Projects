
exports.alerts = (req, res, next) => {
    const {alert} = req.query;
    if (alert == 'booking') {
        res.locals.alert = 'Your booking was succcessful! Please check your mail for confirmation. If your booking does not show up here immediatly, please come back later'
    }
    next();
};