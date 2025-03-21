export const stammAuthMiddleware = (db) => {
  return async (req, res, next) => {
    if (!req.user?.stamm) {
      return res.status(403).json({ 
        error: 'No stamm assigned. Please contact administrator.' 
      })
    }
    next()
  }
}
