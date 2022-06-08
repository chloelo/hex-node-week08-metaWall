const successHandle = (res, data) => {
  res.send({
    "status": true,
    data
  })
  res.end()
}
const notFoundHandle = (req, res) => {
  res.status(404).send({
    "status": false,
    "message": '無此網站路由'
  });
  res.end();
}
module.exports = {
  successHandle,
  notFoundHandle
}