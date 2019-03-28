var mysql = require('mysql');
var config = require('../config/default.js')

var pool = mysql.createPool({
	host:config.database.HOST,
	user:config.database.USER,
	password:config.database.PASSWORD,
	database:config.database.DATABASE,
});

var query = (sql,val) => {
	return new Promise((resolve,reject)=>{
		pool.getConnection((err,connection)=>{
			if (err){
				return resolve(err)
			} else{
				connection.query(sql,val,(err,rows)=>{
					if (err) {
						reject(err)
					}else{
						resolve(rows)
					}
					connection.release()
				})
			}
		})
	})
}

let mobileUser =
    `create table if not exists mobileUser(
     id INT NOT NULL AUTO_INCREMENT,
     Email VARCHAR(100) NOT NULL,
     password VARCHAR(100) NOT NULL,
     telephone VARCHAR(100)  ,
     username VARCHAR(100),
     avatar VARCHAR(100)  ,
     userLevel INT ,
     balance DOUBLE ,
     signTime VARCHAR(100) ,
     totalConsumption  DOUBLE ,
     PRIMARY KEY ( id )
    )DEFAULT CHARSET=utf8;`
let userAddress =
    `create table if not exists userAddress(
     id INT NOT NULL AUTO_INCREMENT,
     Email VARCHAR(100) NOT NULL DEFAULT  '',
     address VARCHAR(100) NOT NULL DEFAULT '',
     PRIMARY KEY ( id )
    )DEFAULT CHARSET=utf8;`
let restaurant =
    `create table if not exists restaurant(
     id INT NOT NULL AUTO_INCREMENT,
     restaurantName VARCHAR(100) NOT NULL DEFAULT  '',
     password VARCHAR(100) NOT NULL,
     address VARCHAR(100) NOT NULL DEFAULT  '',
     restaurantType  VARCHAR(100) NOT NULL DEFAULT  '',
     profit  DOUBLE NOT NULL DEFAULT  0.00,
     signTime VARCHAR(100) NOT NULL DEFAULT '',
     PRIMARY KEY ( id )
    )DEFAULT CHARSET=utf8;`
let dishes =
    `create table if not exists dishes(
     id INT NOT NULL AUTO_INCREMENT,
     dishName VARCHAR(100) NOT NULL DEFAULT '',
     restaurantName VARCHAR(100) NOT NULL DEFAULT '',
     publishTime VARCHAR(100) NOT NULL DEFAULT '',
     endTime VARCHAR(100) NOT NULL DEFAULT '',
     discount DOUBLE NOT NULL DEFAULT 0.00,
     quantity INT NOT NULL DEFAULT 0,
     image VARCHAR(40) NOT NULL DEFAULT '',
     dishType VARCHAR(40) NOT NULL DEFAULT '',
     price double NOT NULL DEFAULT 0.00,
     detail VARCHAR(1000) NOT NULL DEFAULT '',
      star VARCHAR(40) NOT NULL,
     restaurantId VARCHAR(100) NOT NULL DEFAULT '',
     PRIMARY KEY ( id )
    )DEFAULT CHARSET=utf8;`
let orders =
    `create table if not exists orders(
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL DEFAULT '',
    restaurantName VARCHAR(100) NOT NULL DEFAULT '',
    orderDate VARCHAR(100) NOT NULL DEFAULT '',
    orderTime VARCHAR(100) NOT NULL DEFAULT '',
    address VARCHAR(100) NOT NULL DEFAULT '',
    status VARCHAR(100) NOT NULL DEFAULT '',
    totalPrice DOUBLE NOT NULL DEFAULT 0.00,
    cashTime VARCHAR(100) NOT NULL DEFAULT '',
    payTime VARCHAR(100),
    sendingTime VARCHAR(100),
    orderDay  VARCHAR(100) NOT NULL DEFAULT '',
    PRIMARY KEY ( id )
    )DEFAULT CHARSET=utf8;`
let orderDish =
    `create table if not exists orderDish(
    id INT NOT NULL AUTO_INCREMENT,
    orderID INT NOT NULL DEFAULT 0 ,
    restaurantName VARCHAR(100) NOT NULL DEFAULT '',
    dishID VARCHAR(100) NOT NULL DEFAULT '',
    dishName VARCHAR(100) NOT NULL DEFAULT '',
    quantity INT NOT NULL DEFAULT 0,
    image VARCHAR(100) NOT NULL DEFAULT '',
    price DOUBLE NOT NULL DEFAULT 0.00,
    discount DOUBLE NOT NULL DEFAULT 0.00,
     PRIMARY KEY ( id )
    )DEFAULT CHARSET=utf8;`
let message =
    `create table if not exists message(
    id INT NOT NULL AUTO_INCREMENT,
    senderName VARCHAR(100) NOT NULL DEFAULT '',
    receiverName VARCHAR(100) NOT NULL DEFAULT '',
    sendTime VARCHAR(100) NOT NULL DEFAULT '',
    detail VARCHAR(100) NOT NULL DEFAULT '',
    messageType VARCHAR(100) NOT NULL DEFAULT '',
    PRIMARY KEY ( id )
    )DEFAULT CHARSET=utf8;`
let manager =
    `create table if not exists manager(
    id INT NOT NULL AUTO_INCREMENT,
    password VARCHAR(100) NOT NULL,
    profit DOUBLE NOT NULL DEFAULT 0.00,
     PRIMARY KEY ( id )
    )DEFAULT CHARSET=utf8;`
let comments =
    `create table if not exists comments(
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL DEFAULT '',
    commentDate VARCHAR(100) NOT NULL DEFAULT '',
    content VARCHAR(100) NOT NULL DEFAULT '',
    restaurantName VARCHAR(100) NOT NULL DEFAULT '',
    dishName VARCHAR(100) NOT NULL DEFAULT '',
    avatar VARCHAR(100) NOT NULL DEFAULT '',
    dishId INT NOT NULL,
    PRIMARY KEY ( id )
    )DEFAULT CHARSET=utf8;`
let likes =
    `create table if not exists likes(
    id INT NOT NULL AUTO_INCREMENT,
    likeOrDislike VARCHAR(100) NOT NULL DEFAULT '',
    username VARCHAR(100) NOT NULL DEFAULT '',
    restaurantName VARCHAR(100) NOT NULL DEFAULT '',
    dishName VARCHAR(100) NOT NULL DEFAULT '',
    dishImage VARCHAR(100) NOT NULL DEFAULT '',
    star VARCHAR(100) NOT NULL DEFAULT '',
    dishId INT NOT NULL,
    PRIMARY KEY ( id )
    )DEFAULT CHARSET=utf8;`
let createTable = ( sql ) => {
  return query( sql, [] )
}
// 建表
createTable(mobileUser)
createTable(userAddress)
createTable(restaurant)
createTable(dishes)
createTable(orders)
createTable(orderDish)
createTable(message)
createTable(manager)
createTable(comments)
createTable(likes)
// 添加餐厅
let addRestaurant = ( value ) => {
  let _sql = `insert into restaurant set restaurantName=?,password=?,address=?,restaurantType=?,profit=?,signTime=?`
  return query( _sql, value)
}
// 删除餐厅
let deleteRestaurant = (restaurantName) => {
  let _sql = `delete from restaurant where restaurantName="${restaurantName}"; `
  return query( _sql)
}
// 查找餐厅
let findRestaurant = (restaurantName) => {
	var _sql = `select * from restaurant where restaurantName="${restaurantName}"; `
  return query( _sql )
}
// 添加餐厅
let addMessage = ( value ) => {
    let _sql = `insert into message set senderName=?,receiverName=?,sendTime=?,detail=?,messageType=?`
    return query( _sql, value)
}
//修改餐厅基本信息
let updateRestaurantProfile = (oldName,newName,address,restaurantType) => {
    var _sql = `update restaurant set restaurantName = "${newName}", address =  "${address}", restaurantType =  "${restaurantType}" where restaurantName="${oldName}"; `
    return query( _sql )
}
let updateCommentRestaurantName = (oldName,newName) => {
    var _sql = `update comments set restaurantName = "${newName}" where restaurantName="${oldName}"; `
    return query( _sql )
}
let updateDishesRestaurantName = (oldName,newName) => {
    var _sql = `update dishes set restaurantName = "${newName}" where restaurantName="${oldName}"; `
    return query( _sql )
}
let updateLikesRestaurantName = (oldName,newName) => {
    var _sql = `update likes set restaurantName = "${newName}" where restaurantName="${oldName}"; `
    return query( _sql )
}
let updateOrderDishesRestaurantName = (oldName,newName) => {
    var _sql = `update orderDish set restaurantName = "${newName}" where restaurantName="${oldName}"; `
    return query( _sql )
}
let updateOrdersRestaurantName = (oldName,newName) => {
    var _sql = `update orders set restaurantName = "${newName}" where restaurantName="${oldName}"; `
    return query( _sql )
}
//修改餐厅密码
let updateRestaurantPassword = (restaurantName, newPassword) => {
    var _sql = `update restaurant set password = "${newPassword}" where restaurantName="${restaurantName}"; `
    return query( _sql )
}
// 查询所有数据
let findData = (table) => {
	var _sql = `select * from ${table}; `
  return query( _sql )
}
// 查询餐厅消息
let findMessage = (restaurantName) => {
    var _sql = `select * from message where receiverName = '${restaurantName}'; `
    return query( _sql )
}
// 查询餐厅收入
let getProfit = (restaurantName) => {
    var _sql = `select * from restaurant where restaurantName = '${restaurantName}'; `
    return query( _sql )
}
// 查询经理收入
let getProfitAdmin = () => {
    var _sql = `select * from manager ; `
    return query( _sql )
}
// 查询餐厅订餐统计信息
let getRestaurantOrder = (restaurantName) => {
    var _sql = `select * from orders where restaurantName = '${restaurantName}' ; `
    return query( _sql )
}
// 查询餐厅退订统计信息
let getRestaurantBackOrder = (restaurantName) => {
    var _sql = `select * from orders where restaurantName = '${restaurantName}' and status='退订' ; `
    return query( _sql )
}
// 分页数据查找
let findPageData = (table,page,num) => {
  var _sql = `select * from ${table} limit ${(page - 1) * num},${num}; `
  return query(_sql)
}
// 分页餐厅数据查找
let findRestaurantPageData = (table,page,num,restaurantName) => {
    var _sql = `select * from ${table} where restaurantName = '${restaurantName}' limit ${(page - 1) * num},${num}; `
    return query(_sql)
}
// 分页餐厅数据查找
let findMessagePageData = (page,num,restaurantName) => {
    var _sql = `select * from message where receiverName = '${restaurantName}' limit ${(page - 1) * num},${num}; `
    return query(_sql)
}
// 分页餐厅收入查找
let getProfitPageData = (page,num,restaurantName) => {
    var _sql = `select * from restaurant where restaurantName = '${restaurantName}' limit ${(page - 1) * num},${num}; `
    return query(_sql)
}
// 分页经理收入查找
let getProfitPageDataAdmin = (page,num) => {
    var _sql = `select * from manager limit ${(page - 1) * num},${num}; `
    return query(_sql)
}
// 分页餐厅订餐信息查找
let getRestaurantOrderPageData = (page,num, restaurantName) => {
    var _sql = `select * from orders where restaurantName = '${restaurantName}'  limit ${(page - 1) * num},${num}; `
    return query(_sql)
}
// 分页餐厅退订信息查找
let getRestaurantBackOrderPageData = (page,num,restaurantName) => {
    var _sql = `select * from orders where restaurantName = '${restaurantName}' and status='退订' limit ${(page - 1) * num},${num}; `
    return query(_sql)
}
//查询菜肴数据表中所有餐厅名称
let findAllRestaurantName = () => {
    var _sql = `select * from restaurant where restaurantName!='admin'; `
    return query( _sql )
}
// 通过餐厅名称查找
let findDataByRestaurantName = (data) => {
  var _sql = `select * from dishes where restaurantName=?; `
  return query( _sql, data )
}
// 通过餐厅编号查找
let findDataByRestaurantId = (data) => {
    var _sql = `select * from dishes where restaurantId=?; `
    return query( _sql, data)
}
// 通过餐厅编号获取餐厅名称
let getRestaurantNameByRestaurantId = (data) => {
    var _sql = `select restaurantName from restaurant where id=?; `
    return query( _sql, data)
}
// 通过餐厅名称获取餐厅编号
let getRestaurantIdByName = (data) => {
    var _sql = `select id from restaurant where restaurantName=?; `
    return query( _sql, data)
}
// 通过id查找
let findDataById = (id) => {
	var _sql = `select * from dishes where id="${id}"; `
  return query( _sql )
}
// 通过菜肴编号和菜名获取餐厅名称
let getRestaurantName= (dishId, dishName) => {
    var _sql = `select * from dishes where id="${dishId}" and dishName = "${dishName}";`
    return query( _sql )
}
let insertData = ( value ) => {
  let _sql = `insert into dishes set dishName=?,restaurantName=?,publishTime=?,endTime=?,discount=?,quantity=?,image=?,dishType=?,price=?,detail=?,star=?,restaurantId=?;`
  return query( _sql, value )
}
let updateDataHasImg = ( value ) => {
  let _sql = `update dishes set dishName=?,dishType=?,star=?,image=?,discount=?,endTime=?,quantity=?,price=?,detail=? where id=?; `
  return query( _sql, value )
}
let updateDataNoneImg = ( value ) => {
  let _sql = `update dishes set dishName=?,endTime=?,discount=?,quantity=?,dishType=?,price=?,detail=? star=?where id=?; `
  return query( _sql, value )
}
// 删除dishes
let deleteDishes = ( id ) => {
  let _sql = `delete from dishes where id="${id}"; `
  return query( _sql )
}
// 审批通过
let agreeMessage = ( id ) => {
    let _sql = `update message set messageType = '审批通过' where id="${id}"; `
    return query( _sql )
}
// 删除消息
let deleteMessage = ( id ) => {
    let _sql = `delete from message where id="${id}"; `
    return query( _sql )
}
let getDataById = ( id ) => {
  var _sql = `select * from dishes where id="${id}"; `
  return query( _sql )
}


// 手机端相关功能

// 通过邮箱查找用户
let findMobileUserByEmail= ( Email ) => {
    var _sql = `select * from mobileUser where Email="${Email}";`
    return query( _sql )
}
// 通过用户名查找用户
let findMobileUserByName = ( name ) => {
  var _sql = `select * from mobileUser where username="${ name }";`
  return query( _sql )
}
// 添加手机用户
let addMobileUser = ( value ) => {
  var _sql = `insert into mobileUser set Email=?,password=?,userLevel=?,balance=?,signTime=?,totalConsumption=?`
  return query( _sql , value)
}
// 检测用户登录信息的有效性
let checkUser = (value) => {
  var _sql = `select * from mobileUser where Email=?;`
  return query(_sql, value)
}
// 修改用户信息
let updateMobileUser = (value) => {
    var _sql = `update mobileUser set telephone=?,username=? where Email =?;`
    return query(_sql, value)
}
//增加用户地址
let addUserAddress = (value) => {
    var _sql = `insert into userAddress set Email=?,address=?`
    return query(_sql, value)
}
//更改用户密码
let editPassword = (value) => {
    var _sql = `update mobileUser set password=? where Email=?`
    return query(_sql, value)
}
//用户充值
let editBalance= (value) => {
    var _sql = `update mobileUser set balance=balance+? where Email=?`
    return query(_sql, value)
}
//修改用户级别
let editUserLevel= (value) => {
    var _sql = `update mobileUser set userLevel=? where Email=?`
    return query(_sql, value)
}
//注销用户
let overUser= (value) => {
    var _sql = `update mobileUser set Email='fail over' where Email=?`
    return query(_sql, value)
}
// 添加头像
let updateMobileAvatar = ( value ) => {
  var _sql = `update mobileUser set avatar=? where Email=?;`
  return query( _sql , value)
}
// 修改评论里的头像
let updateMobileCommentAvatar = ( value ) => {
  var _sql = `update comments set avatar=? where username=?;`
  return query( _sql , value)
}
// 增加评论
let addComment = (value) => {
  var _sql = `insert into comments set username=?,commentDate=?,content=?,restaurantName=?,dishName=?,avatar=?,dishId=?;`
  return query( _sql , value )
}
// 通过id获取评论
let getCommentById = (id) => {
  var _sql = `select * from comments where dishId="${id}"; `
  return query( _sql )
}
// 通过用户名获取评论
let getCommentByUser = (name) => {
  var _sql = `select * from comments where username="${name}"; `
  return query( _sql )
}
// 删除评论
let deleteComment = (id) => {
  var _sql = `delete from comments where id="${id}"; `
  return query( _sql )
}
// 增加like
let addLike = (value) => {
  var _sql = `insert into likes set likeOrDislike=?,username=?,restaurantName=?,dishName=?,dishImage=?,star=?,dishId=?; `
  return query( _sql , value )
}
// 获取单个dish里的用户like状态
let getLike = (Email,dishId) => {
  var _sql = `select * from likes where username='${Email}' AND dishid='${dishId}'; `
  return query( _sql )
}
// 获取个人中心自己like/dislike的列表
let getLikeList = (name,num) => {
  var _sql = `select * from likes where username='${name}' AND likeOrDislike='${num}'; `
  return query( _sql )
}
// 获取喜欢的数量
let getLikeStar = (type,id) => {
  var _sql = `select count(*) from likes where likeOrDislike='${type}' AND dishid='${id}' ; `
  return query( _sql )
}
// 获取单篇文章like/dislike总的数量
let getUidLikeLength = (id) => {
  var _sql = `select count(*) from likes where dishid='${id}'; `
  return query( _sql )
}
// 更新dish star分数
let updateDishStar = (value) => {
    var _sql = `update dishes set star=? where id=?; `
    return query( _sql,value )
}
// 更新likes star分数
let updateLikeStar = (value) => {
  var _sql = `update likes set star=? where dishId=?; `
  return query( _sql,value )
}
// 搜索
let search = (value) => {
  var _sql = `select * from dishes where dishName like '%${value}%';`
  return query( _sql )
}
let updateLikeName =  ( value ) => {
    let _sql = `update likes set dishName=? where dishId=?; `
    return query(_sql, value)
}
let updateCommentName = (value) => {
    let _sql = `update comments set dishName=? where dishId=?; `
    return query(_sql, value)
}
// 更新
let updateLikesImg = ( value ) => {
    var _sql = `update likes set dishImage=? where dishId=?;`
    return query( _sql, value )
}
//获取地址列表
let findAddressListsByUsername = (Email) => {
    var _sql = `select distinct address from userAddress where Email='${Email}';`
    return query( _sql )
}
//获取下单日期列表
let findOrderDayListByUsername = (Email) => {
    var _sql = `select distinct orderDay from orders where username='${Email}';`
    return query( _sql )
}
//获取下单日期列表
let findOrderRestaurantNameListByUsername = (Email) => {
    var _sql = `select distinct restaurantName from orders where username='${Email}';`
    return query( _sql )
}
//获取购物车数据
let findCarDataByUsername = (Email) => {
    var _sql = `select * from orders where username='${Email}' and status='购物车';`
    return query( _sql )
}
//获取取消订单列表数据
let findCancelOrderDataByUsername = (Email) => {
    var _sql = `select * from orders where username='${Email}' and status='取消';`
    return query( _sql )
}
//获取待支付订单列表数据
let findWaitingOrderDataByUsername = (Email) => {
    var _sql = `select * from orders where username='${Email}' and status='待支付';`
    return query( _sql )
}
//获取配送中订单列表数据
let findSendingOrderDataByUsername = (Email) => {
    var _sql = `select * from orders where username='${Email}' and status='配送中';`
    return query( _sql )
}
//获取已完成订单列表数据
let findAlreadyOrderDataByUsername = (Email) => {
    var _sql = `select * from orders where username='${Email}' and status='确认收货';`
    return query( _sql )
}
//获取退订订单列表数据
let findBackOrderDataByUsername = (Email) => {
    var _sql = `select * from orders where username='${Email}' and status='退订';`
    return query( _sql )
}
//获取点餐记录
let findOrderRecordByUsername = (Email) => {
    var _sql = `select * from orders where username='${Email}';`
    return query( _sql )
}
//获取满足金额区间的点餐记录
let findOrderRecordByCashRangeAndUsername = (data) => {
    var _sql = `select * from orders where totalPrice>? and totalPrice<=? and username=?;`
    return query( _sql, data)
}
//获取满足餐厅名称的点餐记录
let findOrderRecordByRestaurantNameAndUsername = (data) => {
    var _sql = `select * from orders where restaurantName=? and username=?;`
    return query( _sql, data)
}
//获取满足金额区间和餐厅名称的点餐记录
let findOrderRecordByCashRangeAndRestaurantNameAndUsername = (data) => {
    var _sql = `select * from orders where totalPrice>? and totalPrice<=? and restaurantName=? and username=?;`
    return query( _sql, data)
}
//获取满足日期的点餐记录
let findOrderRecordByOrderDayAndUsername = (data) => {
    var _sql = `select * from orders where orderDay=? and username=?;`
    return query( _sql, data)
}
//获取满足金额区间和日期的点餐记录
let findOrderRecordByCashRangeAndOrderDayAndUsername = (data) => {
    var _sql = `select * from orders where totalPrice>? and totalPrice<=? and orderDay=? and username=?;`
    return query( _sql, data)
}
//获取满足日期和餐厅名称的点餐记录
let findOrderRecordByOrderDayAndRestaurantNameAndUsername = (data) => {
    var _sql = `select * from orders where orderDay=? and restaurantName = ? and username=?;`
    return query( _sql, data)
}
//获取满足金额区间，餐厅名称和日期的点餐记录
let findOrderRecordByCashRangeAndOrderDayAndRestaurantNameAndUsername = (data) => {
    var _sql = `select * from orders where totalPrice>? and totalPrice<=? and orderDay=? and restaurantName = ? and username=?;`
    return query( _sql, data)
}
//获取满足金额区间，餐厅名称和日期的退订记录
let findBackOrderRecordByCashRangeAndOrderDayAndRestaurantNameAndUsername = (data) => {
    var _sql = `select * from orders where totalPrice>? and totalPrice<=? and orderDay=? and restaurantName = ? and username=? and status = '退订';`
    return query( _sql, data)
}
//获取用户总消费
let getUserTotalConsumption = (data) => {
    var _sql = `select sum(totalPrice) as consumptionTotal from orders where  username=?;`
    return query( _sql, data)
}
//增加order
let addOrder = (data) => {
    var _sql = `insert into orders set username=?,restaurantName=?,orderDate=?,orderDay=?,orderTime='',cashTime='', address='', status='购物车', totalPrice=0.00;`
    return query( _sql , data)
}
//获取order编号
let getOrderId = (data) => {
    var _sql = `select id from orders where username=? and restaurantName=? and status='购物车';`
    return query( _sql, data)
}
//增加order中的菜单
let addOrderDish = (data) => {
    var _sql = `insert into orderDish set orderID=?, restaurantName=?, dishID=?, dishName=?,image=?,price=?, discount=?, quantity=1;`
    return query( _sql, data)
}
//检查是否已有购物车订单
let checkUserRestaurantCar = (data) => {
    var _sql = `select * from orders where username=? and  restaurantName=? and status='购物车';`
    return query( _sql, data)
}
//获取订单详情
let findOrderDishByOrderId = (data) => {
    var _sql = `select * from orderDish where  orderID=?;`
    return query( _sql, data)
}
//取消订单
let cancelOrder = (orderId) => {
    var _sql = `update orders set status = '取消' where id = '${orderId}';`
    return query( _sql)
}
//确认订单
let confirmOrder = (data) => {
    var _sql = `update orders set totalPrice=?, orderTime=?, address=?, cashTime=?, status = '待支付' where id =?;`
    return query( _sql, data)
}
//获取订单总价
let getOrderPrice = (data) => {
    var _sql = `select * from orderDish where orderID =?;`
    return query( _sql, data)
}
//获取订单送餐时间与地址
let getOrderAddressAndTime = (data) => {
    var _sql = `select * from orders where id =?;`
    return query( _sql, data)
}
//获取订单确认时间
let getOrderCashTime = (data) => {
    var _sql = `select cashTime, totalPrice from orders where id =?;`
    return query( _sql, data)
}
//获取订单预计送达时间
let getOrderSendingTime = (data) => {
    var _sql = `select payTime, sendingTime, totalPrice from orders where id =?;`
    return query( _sql, data)
}
//自动取消订单
let changeToCancel = (data) => {
    var _sql = `update orders  set status = '取消'  where id =?;`
    return query( _sql, data)
}
//退订订单
let changeToBack = (data) => {
    var _sql = `update orders  set status = '退订'  where id =?;`
    return query( _sql, data)
}
//默认确认收货
let changeToConfirm = (data) => {
    var _sql = `update orders  set status = '确认收货'  where id =?;`
    return query( _sql, data)
}
//获取用户级别
let getUserLevel = (data) => {
    var _sql = `select userLevel from mobileUser where Email=?;`
    return query( _sql, data)
}
//改变用户余额
let changeUserBalance = (data) => {
    var _sql = `update mobileUser set balance=? where Email=?;`
    return query( _sql, data)
}
//增加用户消费额度
let addUserConsumption = (data) => {
    var _sql = `update mobileUser set totalConsumption=totalConsumption+? where Email=?;`
    return query( _sql, data)
}
//获取订单中菜肴的编号列表
let getOrderDishesList = (data) => {
    var _sql = `select dishID from orderDish where orderID=?;`
    return query( _sql, data)
}
//减少菜肴剩余数量
let reduceDishQuantity = (data) => {
    var _sql = `update dishes set quantity = quantity-1 where id=?;`
    return query( _sql, data)
}
//将订单状态改为"配送中"
let changeToSending = (data) => {
    var _sql = `update orders set status = '配送中' where id=?;`
    return query( _sql, data)
}
//添加订单预计送达时间
let addSendingTime = (data) => {
    var _sql = `update orders set sendingTime=? where id=?;`
    return query( _sql, data)
}
//添加订单付款时间
let addPayTime = (data) => {
    var _sql = `update orders set payTime=? where id=?;`
    return query( _sql, data)
}
//增加餐厅收入
let addRestaurantProfit = (data) => {
    var _sql = `update restaurant set profit=profit+? where restaurantName=?;`
    return query( _sql, data)
}
//增加经理收入
let addManagerProfit = (data) => {
    var _sql = `update manager set profit=profit+?;`
    return query( _sql, data)
}
module.exports = {
	addRestaurant,
    deleteRestaurant,
	findRestaurant,
    addMessage,
    updateRestaurantProfile,
    //更新餐厅名称相关表的信息也要更改
    updateCommentRestaurantName,
    updateDishesRestaurantName,
    updateLikesRestaurantName,
    updateOrderDishesRestaurantName,
    updateOrdersRestaurantName,
    updateRestaurantPassword,
    findData,
    findMessage,
    getProfit,
    getProfitAdmin,
    getRestaurantOrder,
    getRestaurantBackOrder,
    findPageData,
    findMessagePageData,
    getProfitPageData,
    getProfitPageDataAdmin,
    getRestaurantOrderPageData,
    getRestaurantBackOrderPageData,
    findRestaurantPageData,
    findAllRestaurantName,
    findDataByRestaurantName,
	findDataById,
    insertData,
	updateDataHasImg,
    deleteDishes,
    agreeMessage,
    deleteMessage,
    getDataById,
    findMobileUserByName,
    findMobileUserByEmail,
    getRestaurantName,
    getRestaurantIdByName,
    addMobileUser,
    checkUser,
    updateMobileUser,
    addUserAddress,
    editPassword,
    editBalance,
    editUserLevel,
    overUser,
    updateMobileAvatar,
    updateMobileCommentAvatar,
    addComment,
    getCommentById,
    getCommentByUser,
    deleteComment,
    addLike,
    getLike,
    getLikeList,
    getLikeStar,
    getUidLikeLength,
    updateDishStar,
    updateLikeStar,
    search,
    updateLikeName,
    updateCommentName,
    updateLikesImg,
    findAddressListsByUsername,
    addOrder,
    getOrderId,
    addOrderDish,
    checkUserRestaurantCar,
    findCarDataByUsername,
    findOrderDishByOrderId,
    cancelOrder,
    findCancelOrderDataByUsername,
    findDataByRestaurantId,
    getRestaurantNameByRestaurantId,
    confirmOrder,
    findWaitingOrderDataByUsername,
    getOrderPrice,
    getOrderAddressAndTime,
    getOrderCashTime,
    changeToCancel,
    getUserLevel,
    changeUserBalance,
    addUserConsumption,
    getOrderDishesList,
    reduceDishQuantity,
    changeToSending,
    addSendingTime,
    addPayTime,
    findSendingOrderDataByUsername,
    getOrderSendingTime,
    changeToConfirm,
    changeToBack,
    findAlreadyOrderDataByUsername,
    findBackOrderDataByUsername,
    findOrderRecordByUsername,
    findOrderDayListByUsername,
    findOrderRestaurantNameListByUsername,
    findOrderRecordByCashRangeAndUsername,
    findOrderRecordByRestaurantNameAndUsername,
    findOrderRecordByCashRangeAndRestaurantNameAndUsername,
    findOrderRecordByOrderDayAndUsername,
    findOrderRecordByCashRangeAndOrderDayAndUsername,
    findOrderRecordByOrderDayAndRestaurantNameAndUsername,
    findOrderRecordByCashRangeAndOrderDayAndRestaurantNameAndUsername,
    findBackOrderRecordByCashRangeAndOrderDayAndRestaurantNameAndUsername,
    getUserTotalConsumption,
    addRestaurantProfit,
    addManagerProfit
}
