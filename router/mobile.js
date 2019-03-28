let router = require('koa-router')()
let apiModel = require('../lib/sql.js')
let path = require('path')
let koaBody = require('koa-body')
let fs = require('fs')
let moment = require('moment')
let md5 = require('md5')
let checkToken = require('../middlewares/check').checkToken
let jwt = require('jsonwebtoken');
let config = require('../config/default.js')

// 存储手机端的用户信息
router.post('/vi/signin', koaBody(), async (ctx, next) => {
    var data = ctx.request.body
    data = typeof data == 'string' ? JSON.parse(data) : data
    var name = data.userName
    var pass = data.password;

    let token = jwt.sign({
        userName: name
    }, config.jwt_secret , {
        expiresIn: '30 days'
    });

    await apiModel.findMobileUserByEmail(name)
        .then(res => {
            // console.log('用户信息', res)
            if (res[0]['Email'] === name && res[0]['password'] === pass) {
                ctx.body = {
                    code: 200,
                    avator: res[0]['avator'],
                    token: token,
                    message: '登录成功'
                }
            } else {
                ctx.body = {
                    code: 500,
                    message: '用户名或密码错误'
                }
            }
        }).catch(() => {
            ctx.body = {
                code: 201,
                msg: '注册成功',
                token: token
            }
           apiModel.addMobileUser([name, pass, 0, 0.00, moment().format('YYYY-MM-DD HH:mm'),0.00])
        })
})
// 获取各个餐厅的数据
router.post('/vi/restaurantDishLists',  koaBody() ,async(ctx) => {
    var {restaurantId} = ctx.request.body
    await apiModel.findDataByRestaurantId([restaurantId])
            .then(res => {
        ctx.body = {
            code: 200,
            data: res,
            message:'获取列表成功'
        }
    })
        .catch(err=>{
        ctx.body = {
            code: 500,
            message: '获取列表失败'
        }
    })
})
// 获取餐厅名称
router.post('/vi/restaurantNameByRestaurantId',  koaBody() ,async(ctx) => {
    var {restaurantId} = ctx.request.body
    await apiModel.getRestaurantNameByRestaurantId([restaurantId])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取名称成功'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取餐厅名称失败'
            }
        })
})
//获取餐厅名称列表
router.get('/vi/restaurantNameLists', async(ctx, next) => {
    await apiModel.findAllRestaurantName()
        .then(res => {
            ctx.body={
                    data:res,
                    code: 200,
                    message:'获取餐厅名称列表成功'
                }
        })
        .catch(res => {
            ctx.body = {
                code:500,
                message:'获取餐厅名称列表失败！'
            }
        })
})
//获得地址
router.post('/vi/addressLists', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.findAddressListsByUsername(Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取地址列表失败'
            }
        })
})
//获得下单日期
router.post('/vi/orderDayList', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.findOrderDayListByUsername(Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取下单日期列表失败'
            }
        })
})
//获得下单餐厅列表
router.post('/vi/restaurantNameData', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.findOrderRestaurantNameListByUsername(Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取下单餐厅名称列表失败'
            }
        })
})
//获得满足金额区间的订餐记录列表
router.post('/vi/orderRecordCashRange', koaBody() ,async (ctx) => {
    var {cashRange, Email} = ctx.request.body
    let lowPrice=0;
    let highPrice=0;
    if(cashRange==1){
        highPrice=20;
    }else if(cashRange==2){
        lowPrice=20;
        highPrice=50;
    }else if(cashRange==3){
        lowPrice=50;
        highPrice=100;
    }else if(cashRange==4){
        lowPrice=100;
        highPrice=200;
    }else if(cashRange==5){
        lowPrice=200;
        highPrice=100000;
    }
    await apiModel.findOrderRecordByCashRangeAndUsername([lowPrice, highPrice, Email])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取满足金额区间的订餐记录列表失败'
            }
        })
})
//获得满足餐厅名称的订餐记录列表
router.post('/vi/orderRecordRestaurantName', koaBody() ,async (ctx) => {
    var {restaurantName, Email} = ctx.request.body
    await apiModel.findOrderRecordByRestaurantNameAndUsername([restaurantName, Email])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取满足餐厅名称的订餐记录列表失败'
            }
        })
})
//获得满足金额区间和餐厅名称的订餐记录列表
router.post('/vi/orderRecordCashRangeAndRestaurantName', koaBody() ,async (ctx) => {
    var {cashRange, restaurantName, Email} = ctx.request.body
    let lowPrice=0;
    let highPrice=0;
    if(cashRange==1){
        highPrice=20;
    }else if(cashRange==2){
        lowPrice=20;
        highPrice=50;
    }else if(cashRange==3){
        lowPrice=50;
        highPrice=100;
    }else if(cashRange==4){
        lowPrice=100;
        highPrice=200;
    }else if(cashRange==5){
        lowPrice=200;
        highPrice=100000;
    }
    await apiModel.findOrderRecordByCashRangeAndRestaurantNameAndUsername([lowPrice, highPrice, restaurantName, Email])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取满足金额区间和餐厅名称的订餐记录列表失败'
            }
        })
})
//获得满足日期的订餐记录列表
router.post('/vi/orderRecordOrderDay', koaBody() ,async (ctx) => {
    var {orderDay, Email} = ctx.request.body
    await apiModel.findOrderRecordByOrderDayAndUsername([orderDay, Email])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取满足日期的订餐记录列表失败'
            }
        })
})
//获得满足日期和金额区间的订餐记录列表
router.post('/vi/orderRecordOrderDayAndCashRange', koaBody() ,async (ctx) => {
    var {cashRange, orderDay, Email} = ctx.request.body
    let lowPrice=0;
    let highPrice=0;
    if(cashRange==1){
        highPrice=20;
    }else if(cashRange==2){
        lowPrice=20;
        highPrice=50;
    }else if(cashRange==3){
        lowPrice=50;
        highPrice=100;
    }else if(cashRange==4){
        lowPrice=100;
        highPrice=200;
    }else if(cashRange==5){
        lowPrice=200;
        highPrice=100000;
    }
    await apiModel.findOrderRecordByCashRangeAndOrderDayAndUsername([lowPrice, highPrice, orderDay, Email])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取满足日期和金额区间的订餐记录列表失败'
            }
        })
})
//获得满足日期和餐厅名称的订餐记录列表
router.post('/vi/orderRecordOrderDayAndRestaurantName', koaBody() ,async (ctx) => {
    var {orderDay, restaurantName, Email} = ctx.request.body
    await apiModel.findOrderRecordByOrderDayAndRestaurantNameAndUsername([orderDay, restaurantName, Email])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取满足日期和餐厅名称的订餐记录列表失败'
            }
        })
})
//获得满足日期，餐厅名称和金额区间的订餐记录列表
router.post('/vi/orderRecordOrderDayAndRestaurantNameAndCashRange', koaBody() ,async (ctx) => {
    var {cashRange, orderDay, restaurantName, Email} = ctx.request.body
    let lowPrice=0;
    let highPrice=0;
    if(cashRange==1){
        highPrice=20;
    }else if(cashRange==2){
        lowPrice=20;
        highPrice=50;
    }else if(cashRange==3){
        lowPrice=50;
        highPrice=100;
    }else if(cashRange==4){
        lowPrice=100;
        highPrice=200;
    }else if(cashRange==5){
        lowPrice=200;
        highPrice=100000;
    }
    await apiModel.findOrderRecordByCashRangeAndOrderDayAndRestaurantNameAndUsername([lowPrice, highPrice, orderDay, restaurantName, Email])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取满足日期，餐厅名称和金额区间的订餐记录列表失败'
            }
        })
})
//获得满足日期，餐厅名称和金额区间的退订记录列表
router.post('/vi/backOrderRecordOrderDayAndRestaurantNameAndCashRange', koaBody() ,async (ctx) => {
    var {cashRange, orderDay, restaurantName, Email} = ctx.request.body
    let lowPrice=0;
    let highPrice=0;
    if(cashRange==1){
        highPrice=20;
    }else if(cashRange==2){
        lowPrice=20;
        highPrice=50;
    }else if(cashRange==3){
        lowPrice=50;
        highPrice=100;
    }else if(cashRange==4){
        lowPrice=100;
        highPrice=200;
    }else if(cashRange==5){
        lowPrice=200;
        highPrice=100000;
    }
    await apiModel.findBackOrderRecordByCashRangeAndOrderDayAndRestaurantNameAndUsername([lowPrice, highPrice, orderDay, restaurantName, Email])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取满足日期，餐厅名称和金额区间的退订记录列表失败'
            }
        })
})
//获得用户总消费
router.post('/vi/consumptionTotal', koaBody() ,async (ctx) => {
    var { Email} = ctx.request.body
    await apiModel.getUserTotalConsumption([Email])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取总消费成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取用户总消费失败'
            }
        })
})
//增加餐厅和经理的收入
router.post('/vi/addRestaurantAndManagerProfit', koaBody() ,async (ctx) => {
    var {restaurantName, totalPrice} = ctx.request.body
    const tempPrice = parseFloat(totalPrice);
    const restaurantProfit = tempPrice*90/100;
    const managerProfit = tempPrice*10/100;
    await Promise.all([
        apiModel.addRestaurantProfit([restaurantProfit, restaurantName]),
        apiModel.addManagerProfit([managerProfit])
    ])
        .then(res => {
            ctx.body = {
                code: 200,
                message:'增加餐厅和经理的收入成功！'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '增加餐厅和经理的收入失败！'
            }
        })
})
//获得订单详情
router.post('/vi/orderDetail', koaBody() ,async (ctx) => {
    var {orderId} = ctx.request.body
    console.log("orderId", orderId)
    await apiModel.findOrderDishByOrderId([orderId])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取订单详情列表失败'
            }
        })
})
//取消订单
router.post('/vi/cancelOrder', koaBody() ,async (ctx) => {
    var orderId = ctx.request.body.orderId
    await apiModel.cancelOrder(orderId).then(res=>{
        ctx.body = {
            code: 200,
            message:'取消订单成功'
        }
    }).catch(err=>{
        ctx.body = {
            code: 500,
            message:'取消订单失败'
        }
    })
})
//获取订单送餐时间与地址
router.post('/vi/orderAddressAndTime', koaBody() ,async (ctx) => {
    var orderId = ctx.request.body.orderId
    await apiModel.getOrderAddressAndTime([orderId]).then(res=>{
        ctx.body = {
            code: 200,
            data:res,
            message:'获取信息成功'
        }
    })
        .catch(err=>{
        ctx.body = {
            code: 500,
            message:'获取订单时间与地址失败'
        }
    })
})
//获取订单确认时间
router.post('/vi/orderCashTime', koaBody() ,async (ctx) => {
    var orderId = ctx.request.body.orderId
    await apiModel.getOrderCashTime([orderId]).then(res=>{
        ctx.body = {
            code: 200,
            data:res,
            message:'获取信息成功'
        }
    })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message:'获取订单确认时间失败'
            }
        })
})
//获取订单确预计送达时间
router.post('/vi/orderSendingTime', koaBody() ,async (ctx) => {
    var orderId = ctx.request.body.orderId
    await apiModel.getOrderSendingTime([orderId]).then(res=>{
        ctx.body = {
            code: 200,
            data:res,
            message:'获取信息成功'
        }
    })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message:'获取订单预计送达时间失败'
            }
        })
})
//自动取消订单
router.post('/vi/changeToCancel', koaBody() ,async (ctx) => {
    var orderId = ctx.request.body.orderId
    await apiModel.changeToCancel([orderId]).then(res=>{
        ctx.body = {
            code: 200,
            message:'取消订单成功'
        }
    })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message:'自动取消订单失败'
            }
        })
})
//全额退订
router.post('/vi/changeToBack', koaBody() ,async (ctx) => {
    var orderId = ctx.request.body.orderId
    await apiModel.changeToBack([orderId]).then(res=>{
        ctx.body = {
            code: 200,
            message:'退订订单成功'
        }
    })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message:'全额退订订单失败'
            }
        })
})
//退订订单，退还80%金额
router.post('/vi/changeBackAndReduceBalance', koaBody() ,async (ctx) => {
    var {orderId, backCash} = ctx.request.body
    await Promise.all([
        apiModel.changeToBack([orderId])
    ]).then(res=>{
        ctx.body = {
            code: 200,
            message:'退订订单成功'
        }
    })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message:'退订订单失败'
            }
        })
})
//默认确认收货
router.post('/vi/changeToConfirm', koaBody() ,async (ctx) => {
    var orderId = ctx.request.body.orderId
    await apiModel.changeToConfirm([orderId]).then(res=>{
        ctx.body = {
            code: 200,
            message:'确认订单成功'
        }
    })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message:'确认订单失败'
            }
        })
})
//获取用户级别
router.post('/vi/getUserLevel', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.getUserLevel([Email]).then(res=>{
        ctx.body = {
            code: 200,
            data:res,
            message:'获取用户级别成功'
        }
    })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message:'获取用户级别失败'
            }
        })
})
//获取订单总价
router.post('/vi/orderTotalPrice', koaBody() ,async (ctx) => {
    var {orderId} = ctx.request.body
    await apiModel.getOrderPrice([orderId]).then(res=>{
        var length=res.length
        var price=0.00;
        for(let i = 0; i <length; i++){
           price+=parseFloat(res[i]['price'])*parseFloat(res[i]['discount'])/10.00
        }
        if(price>=200){
            price = price-20
        }else if (price >=100 && price <200){
            price = price-10
        }
        ctx.body = {
            code: 200,
            data:price,
            message:'获取订单总价成功'
        }
        console.log("total price", price)
    })
        .catch(err=>{
        ctx.body = {
            code: 500,
            message:'获取订单总价失败'
        }
    })
})
//确认订单
router.post('/vi/confirmOrder', koaBody() ,async (ctx) => {
   var{totalPrice, orderTime, address, orderId}=ctx.request.body
    var cashTime = moment().format('YYYY-MM-DD HH:mm:ss')
    await apiModel.confirmOrder([totalPrice, orderTime, address, cashTime, orderId]).then(res=>{
        ctx.body = {
            code: 200,
            message:'确认订单成功'
        }
    })
        .catch(err=>{
        ctx.body = {
            code: 500,
            message:'确认订单失败'
        }
    })
})
//确认支付
router.post('/vi/confirmPay', koaBody() ,async (ctx) => {
    var{orderId, Email, totalPrice, discount}=ctx.request.body
    await apiModel.findMobileUserByEmail(Email).then(async res => {
        let balance = parseFloat(res[0]['balance']);
        let price = totalPrice - discount;
        if (balance >= price) {/**判断用户余额是否足够，如果足够则减去余额，增加用户总消费额度。*/
            await Promise.all([
                apiModel.changeUserBalance([ balance - price, Email]),
                apiModel.addUserConsumption([price, Email])
            ]).catch(err=>{
                ctx.body = {
                    code: 503,
                    message: '改变用户余额失败！'
                }
            })
            /**判断订单中商品数量是否足够，如果足够则减去数量。*/
            await apiModel.getOrderDishesList([orderId]).then(async res => {
                let listLength = res.length;
                for (let i = 0; i < listLength; i++) {
                    await apiModel.reduceDishQuantity([res[i]['dishID']])
                }
            })
                .catch(err=>{
                    ctx.body = {
                        code: 505,
                        message: '改变菜肴剩余数量！'
                    }
                })
            let payTime = moment().format('YYYY-MM-DD HH:mm')

            function randomWord(randomFlag, min, max) {
                let str = "",
                    range = min,
                    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

                // 随机产生
                if (randomFlag) {
                    range = Math.round(Math.random() * (max - min)) + min;
                }
                let pos = 0;
                for (let i = 0; i < range; i++) {
                    pos = Math.round(Math.random() * (arr.length - 1));
                    str += arr[pos];
                }
                return str;
            }

            let sendingTime= randomWord(false, 2, 2);
            /**改变订单状态为"配送中"，添加付款时间，随机生成预计送达时间。*/
            await Promise.all([
                 apiModel.changeToSending([orderId]),
                 apiModel.addPayTime([payTime, orderId]),
                 apiModel.addSendingTime([sendingTime, orderId])
            ])
                .catch(err=>{
                    ctx.body = {
                        code: 507,
                        message: '改变订单信息失败！'
                    }
                })
            ctx.body = {
                code: 200,
                message: '支付成功！'
            }
        } else {
            ctx.body = {
                code: 501,
                message: '用户余额不足！'
            }
        }
    })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message:'获取用户信息失败'
            }
        })
})
//获得购物车数据
router.post('/vi/car', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.findCarDataByUsername(Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取购物车数据失败'
            }
        })
})
//获得取消的订单列表数据
router.post('/vi/cancelOrderLists', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.findCancelOrderDataByUsername(Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取取消订单列表数据失败'
            }
        })
})
//获得待支付的订单列表数据
router.post('/vi/waitingOrderLists', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.findWaitingOrderDataByUsername(Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取待支付订单列表数据失败'
            }
        })
})
//获得已完成的订单列表数据
router.post('/vi/alreadyOrderLists', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.findAlreadyOrderDataByUsername(Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取已完成订单列表数据失败'
            }
        })
})
//获得退订的订单列表数据
router.post('/vi/backOrderLists', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.findBackOrderDataByUsername(Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取退订订单列表数据失败'
            }
        })
})
//获得配送中的订单列表数据
router.post('/vi/sendingOrderLists', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.findSendingOrderDataByUsername(Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取配送中订单列表数据失败'
            }
        })
})
//获得点餐记录
router.post('/vi/orderRecord', koaBody() ,async (ctx) => {
    var Email = ctx.request.body.Email
    await apiModel.findOrderRecordByUsername(Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取点餐记录成功'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取点餐记录数据失败'
            }
        })
})
// 获取单个id的信息
router.post('/vi/getDishById', koaBody() ,async (ctx) => {

    var id = ctx.request.body.dishId
    // console.log('id',id)
    await Promise.all([
        apiModel.getDataById(id),
        apiModel.getLikeStar(1,id),
        apiModel.getUidLikeLength(id)
    ])
        .then(res => {
            console.log(res)
            ctx.body = {
                code: 200,
                data: res,
                message: '获取详情成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取详情失败'
            }
        })
})
// 获取菜肴的评论
router.post('/vi/getDishComment', koaBody(), async (ctx) => {
    // console.log(ctx.request.body)
    await apiModel.getCommentById(ctx.request.body.dishId)
        .then(res => {
            ctx.body = {
                code:200,
                data:res,
                message:'获取评论成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取评论失败'
            }
        })
})
// 获取用户的评论
router.post('/vi/getUserComment', koaBody(),async (ctx) => {

    await apiModel.getCommentByUser(ctx.request.body.userName)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message: '获取用户的评论成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取用户的评论失败'
            }
        })
})
// 获取用户个人信息
router.post('/vi/findMobileUserByEmail', koaBody(),async (ctx) => {

    await apiModel.findMobileUserByEmail(ctx.request.body.Email)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message: '获取用户信息成功！'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取用户信息失败！'
            }
        })
})
// 获取餐厅名称
router.post('/vi/getRestaurantName', koaBody(),async (ctx) => {

    await apiModel.getRestaurantName(ctx.request.body.dishId, ctx.request.body.dishName)
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message: '获取餐厅名称成功！'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取餐厅名称失败！'
            }
        })
})
// 评论
router.post('/vi/postComment', koaBody(),async(ctx) => {
    var {Email,content,restaurantName,dishName,avatar,dishID} = ctx.request.body
    var date = moment().format('YYYY-MM-DD HH:mm:ss');
        // console.log(res)
        await apiModel.addComment([Email, date, content, restaurantName, dishName, avatar, dishID])
            .then(res => {
                // console.log(res)
                ctx.body = {
                    code: 200,
                    message: '评论成功'
                }
            })
            .catch(err=>{
                ctx.body = {
                    code: 500,
                    message: '评论失败'
                }
            })
})
// 添加购物车
router.post('/vi/postOrder', koaBody(),async(ctx) => {
    var {username, restaurantName, dishID, dishName, price, discount,  image} = ctx.request.body
    var date = moment().format('YYYY-MM-DD HH:mm:ss');
    var day = moment().format('YYYY-MM-DD');
    await apiModel.checkUserRestaurantCar([username, restaurantName]).then(async res => {
        if (res.length === 0) {
            await apiModel.addOrder([username, restaurantName, date, day]).then(res => {
                ctx.body = {
                    code: 200,
                    message: '添加成功！'
                }
            })
                .catch(err => {
                ctx.body = {
                    code: 500,
                    message: '添加失败！'
                }
            })
        }
    })
        .catch(err => {
        ctx.body = {
            code: 505,
            message: '查询失败！'
        }
    })
    await apiModel.getOrderId([username, restaurantName]).then(async res => {
        const orderId = parseInt(res[0]['id']);
        await apiModel.addOrderDish([orderId, restaurantName, dishID, dishName, image, price, discount]).then(res => {
            ctx.body = {
                code: 200,
                message: '添加成功！'
            }
        })
        .catch(err=>{
            ctx.body = {
                code: 500,
                message: '添加失败！'
            }
        })
    })
    .catch(err=>{
        ctx.body = {
            code: 505,
            message: '获取订单编号失败！'
        }
    })
})
// 点击喜欢
router.post('/vi/postUserLike', koaBody(),async(ctx) => {
    var {Email,like,restaurantName, dishName,dishId,dishImage,star} = ctx.request.body
    var newStar
        await apiModel.addLike([like, Email, restaurantName, dishName, dishImage, parseFloat(star), dishId])
        // 修改评分
        await Promise.all([
            apiModel.getLikeStar(1, dishId),
            apiModel.getUidLikeLength(dishId)
        ]).then(async res => {
            console.log(res)
            newStar = (res[0][0]['count(*)'] / res[1][0]['count(*)'] * 10).toFixed(1)
            console.log('newStar', newStar)
        })
        await Promise.all([
            apiModel.updateDishStar([parseFloat(newStar), dishId]),
            apiModel.updateLikeStar([parseFloat(newStar), dishId])
        ])
            .then(res=>{
            ctx.body = {
                code: 200,
                message: '评分成功'
            }
        })
            .catch(err=>{
            ctx.body = {
                code: 500,
                message: '评分失败'
            }
        })
})
// 获取单个dish的like信息
router.post('/vi/getUserSingleLike', koaBody() ,async (ctx) => {

    var {Email,dishId} = ctx.request.body
    await apiModel.getLike(Email, dishId)
        .then(res => {
            ctx.body = {
                code: 200,
                data:res,
                message:'获取单个dish成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取单个dish失败'
            }
        })
})
// 删除评论
router.post('/vi/deleteComment', koaBody(),async(ctx) => {
    await checkToken(ctx).then(async res => {
        // console.log(res)
        await apiModel.deleteComment(ctx.request.body.commentId)
            .then(res => {
                // console.log(res, '删除成功')
                ctx.body = {
                    code: 200,
                    message: '删除成功'
                }
            }).catch(err=>{
                ctx.body = {
                    code: 500,
                    message: '删除失败'
                }
            })

    }).catch(err => {
        // console.log(err)
        ctx.body = err
    })

})
// 获取个人like列表
router.post('/vi/getUserLikeData', koaBody(), async (ctx) => {

    var userName = ctx.request.body.userName

    await Promise.all([
            apiModel.getLikeList(userName,1),
            apiModel.getLikeList(userName,2)
        ]).then(res => {
            ctx.body = {
                code:200,
                data:res,
                message: '获取个人like列表成功'
            }
        }).catch(err=>{
            ctx.body = err
        })

})
//修改用户信息
router.post('/vi/editUser', koaBody(), async(ctx,next)=>{
    var {Email,telephone,username,address} = ctx.request.body
    await Promise.all([
        apiModel.updateMobileUser([telephone,username,Email]),
        apiModel.addUserAddress([Email, address])
    ])
        .then(res => {
            ctx.body = {
                code: 200,
                message: '用户信息修改成功！'
            }
        })
        .catch(err => {
            ctx.body = {
                code: 500,
                message: '用户信息修改失败！'
            }
        })
})
//修改用户密码
router.post('/vi/editPassword', koaBody(), async(ctx,next)=>{
    var {Email,oldPassword,newPassword} = ctx.request.body
    await apiModel.findMobileUserByEmail(Email)
        .then(async res => {
            if (res[0]['password'] == oldPassword) {
                await apiModel.editPassword([newPassword, Email])
                    .then(res => {
                        ctx.body = {
                            code: 200,
                            message: '用户密码修改成功！'
                        }
                    })
                    .catch(err => {
                        ctx.body = {
                            code: 500,
                            message: '用户密码修改失败！'
                        }
                    })
            } else {
                ctx.body = {
                    code: 501,
                    message: '用户密码错误！'
                }
            }
        })
        .catch(err => {
            ctx.body = {
                code: 503,
                message: '未查询到用户！'
            }
        })
})
//用户充值
router.post('/vi/editBalance', koaBody(), async(ctx,next)=>{
    var {Email,balance} = ctx.request.body
    await apiModel.editBalance([parseFloat(balance),Email])
            .then(async res => {
                ctx.body = {
                    code: 200,
                    message: '用户余额修改成功！'
                }
            })
        .catch(err => {
            ctx.body = {
                code: 500,
                message: '用户余额修改失败！'
            }
        })
    await apiModel.findMobileUserByEmail(Email)
        .then(async res => {
            const balance = parseFloat(res[0]['balance']);
            if (balance < 0) {
                apiModel.editUserLevel([-1, Email])
            } else if (balance >= 0 && balance < 3000) {
                apiModel.editUserLevel([0, Email])
            } else if (balance >= 3000 && balance < 5000) {
                apiModel.editUserLevel([1, Email])
            } else if (balance >= 5000 && balance < 10000) {
                apiModel.editUserLevel([2, Email])
            } else if (balance >= 10000) {
                apiModel.editUserLevel([3, Email])
            }
        })
        .catch(err => {
            ctx.body = {
                code: 501,
                message: '查询用户失败！'
            }
        })
})
//注销用户
router.post('/vi/overUser', koaBody(), async(ctx,next)=>{

    var {Email} = ctx.request.body
    await apiModel.overUser(Email)
        .then(async res => {
            ctx.body = {
                code: 200,
                message: '注销成功！'
            }
    }).catch(err => {
        // console.log(err)
        ctx.body = err
        return
    })

})
// 修改用户名
router.post('/vi/editUserName', koaBody(), async(ctx,next)=>{

    var {userName,newName} = ctx.request.body
    var userExist = false;
    await checkToken(ctx).then(async res => {
        // console.log(res)
        await apiModel.findMobileUserByName(newName)
            .then(res => {
                if (res.length == 0) {
                    userExist = false;
                } else {
                    userExist = true
                }
            })
        if (!userExist) {
            let password = ''
            await Promise.all([
                    apiModel.findMobileUserByName(userName),
                    apiModel.updateMobileName([newName, userName]),
                    apiModel.updateMobileCommentName([newName, userName]),
                    apiModel.updateMobileLikeName([newName, userName])
                ])
                .then(res => {
                    // console.log(Object.assign(res[0][0]))
                    password = Object.assign(res[0][0]).password
                    // console.log('用户名修改成功')
                    let nowToken = jwt.sign({
                        userName: newName
                    }, config.jwt_secret , {
                        expiresIn: '30 days'
                    });
                    ctx.body = {
                        code: 200,
                        token: nowToken,
                        message: '用户名修改成功'
                    }
                }).catch(err => {
                    ctx.body = {
                        code: 500,
                        message: '用户名修改失败'
                    }
                })

        }else{
            ctx.body = {
                code: 500,
                message:'用户名存在'
            }
        }
    }).catch(err => {
        // console.log(err)
        ctx.body = err
        return
    })

})
// 获取用户头像
router.post('/vi/getUserAvator',koaBody(),async(ctx)=>{

    await apiModel.findMobileUserByEmail(ctx.request.body.userName)
        .then(res=>{
            // console.log('avator',res)
            // console.log(res)
            if (res.length >= 1 ) {
                // console.log(Object.assign({},res[0]))
                ctx.body = {
                    code: 200,
                    avator: Object.assign({}, res[0]).avatar,
                    message:'获取头像成功'
                }
            }else{
                // 没有上传头像
                ctx.body = {
                    code: 200,
                    avator: '',
                    message: '还没有上传头像'
                }
            }
        }).catch(err=>{
            ctx.body = 'none'
        })

})
// 增加头像
router.post('/vi/uploadAvator',koaBody({
    "formLimit":"5mb",
    "jsonLimit":"5mb",
    "textLimit":"5mb"
}),async(ctx)=>{

    var {userName,avator} = ctx.request.body;
    var base64Data = avator.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    var getName = Number(Math.random().toString().substr(3)).toString(36) + Date.now()
    await checkToken(ctx).then(async res => {
        // console.log(res)
        let uploadDone = await new Promise((reslove, reject) => {
            fs.writeFile('./public/images/avator/' + getName + '.png', dataBuffer, err => {
                if (err) {
                    reject(false)
                }
                reslove(true)
            });
        })
        if (uploadDone) {
            // console.log(getName, userName)
            await Promise.all([
                apiModel.updateMobileAvatar([getName, userName]),
                apiModel.updateMobileCommentAvatar([getName, userName])
            ]).then(res => {
                // console.log(res, '上传成功')
                ctx.body = {
                    code: 200,
                    avator: getName,
                    message: '上传成功'
                }
            }).catch(err=>{
                ctx.body = {
                    code: 500,
                    message: '上传失败'
                }
            })
        }
    }).catch(err => {
        // console.log(err)
        ctx.body = err
    })

})
// 验证码
router.get('/vi/getYzm',async(ctx,next)=>{

    const captcha = require('trek-captcha')
    const { token, buffer } = await captcha({ size: 4})
    let getYzm = false
    // console.log(token, buffer)
    getYzm = await new Promise((reslove,reject)=>{
        fs.createWriteStream('./public/images/yzm.jpg').on('finish',  (data) => {
            reslove(true)
        }).end(buffer)
    })
    if (getYzm){
        ctx.body = {
            code:200,
            data:token,
            message:'获取验证码成功'
        }
    }else{
        ctx.body = {
            code:500,
            data: token,
            message: '获取验证码失败'

        }
    }
    // console.log('验证码',token)
})
// 搜索
router.post('/vi/search',koaBody(), async(ctx)=>{

    var val = ctx.request.body.val
    // console.log(val)
    await apiModel.search(val).then(res=>{
        // console.log('搜索结果',res)
        ctx.body = {
            code:200,
            data:res,
            message:'获取搜索结果成功',
            total:res.length
        }
    })
})
module.exports = router
