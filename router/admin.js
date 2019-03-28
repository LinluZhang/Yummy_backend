var router = require('koa-router')()
var apiModel = require('../lib/sql.js')
var path = require('path')
var koaBody = require('koa-body')
var checkLogin = require('../middlewares/check.js').checkLogin
var checkAdmin = require('../middlewares/check.js').checkAdmin
var checkRestaurant = require('../middlewares/check.js').checkRestaurant
var fs = require('fs')
let moment = require('moment')

router.get('/', async(ctx, next) => {
    var page
    let dataLength = ''
    var restaurantName = ''
    if (ctx.session.user) {
       restaurantName = ctx.session.user
    } else {
        await ctx.render('signin')
    }
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await checkLogin(ctx)
    await apiModel.findDataByRestaurantName(restaurantName).then(res => {
        dataLength = res.length
    })
    await apiModel.findRestaurantPageData('dishes', page, 7, restaurantName).then(res => {
        data = JSON.parse(JSON.stringify(res))
    })
    await ctx.render('list', {
        dishes: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 7),
        nowPage:  parseInt(page)
    })
})
// 获取登录页面
router.get('/signin', async(ctx, next) => {
    if (ctx.session.user) {
        await ctx.redirect('/')
    } else {
        await ctx.render('signin')
    }
})
// 登录 post
router.post('/signin', koaBody(), async(ctx, next) => {
    var {restaurantName,password} = ctx.request.body
    await apiModel.findRestaurant(restaurantName)
        .then((res) => {
            if (res[0]['restaurantName'] === restaurantName && res[0]['password'] === password) {
                ctx.session.user = restaurantName;
                ctx.session.pass = password;
                ctx.redirect('/')
            }else{
                ctx.body = {
                    code:500,
                    message:'密码错误！'
                }
            }
        })
        .catch(res => {
            ctx.body = {
                code:501,
                message:'餐厅不存在！'
            }
        })
})
// 登出
router.get('/signout', async(ctx, next) => {
    ctx.session = null;
    await ctx.redirect('/')
})
//获取注册界面
router.get('/signup', async(ctx, next) => {
 await ctx.render('signup')
})
//注册post
router.post('/signup', koaBody(), async(ctx, next)=>{
    var {restaurantName,address,restaurantType} = ctx.request.body
    await apiModel.findRestaurant(restaurantName)
        .then((res) => {
            if (res[0]['restaurantName'] === restaurantName) {
                ctx.body = {
                    code:500,
                    message:'注册失败！用户名已被占用！'
                }
            }
        })
        .catch(async () => {

            function randomWord(randomFlag, min, max) {
                let str = "",
                    range = min,
                    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

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

            var password = randomWord(false, 7, 7);
            await apiModel.addRestaurant([restaurantName,password,address,restaurantType, 0.00, moment().format('YYYY-MM-DD HH:mm')])
                    .then((res) => {
                        console.log('注册成功！')
                        ctx.body = {
                            code: 200,
                            message: '注册成功！您的注册码为：'+ password + ', 请妥善保管！'
                        }
                    })
        })
})
//更改餐厅信息
router.get('/profile', async(ctx, next) => {
    await checkRestaurant(ctx)
    await ctx.render('profile')
})
router.post('/profile', koaBody(), async(ctx, next) => {
    var {oldName,newName,address,restaurantType} = ctx.request.body
    await apiModel.addMessage(['系统消息','admin',moment().format('YYYY-MM-DD HH:mm'),
        '原名称为\"'+oldName+'\"的餐厅请求将餐厅名称修改为\"'+newName+'\"，将地址修改为\"'+address+'\"，将餐厅类型修改为\"'+restaurantType+'\"。','待审批'])
        .then((res)=>{
            ctx.redirect('/')
        })
    await apiModel.updateRestaurantProfile(oldName,newName,address,restaurantType)
        .then(async (res) => {
            //更新餐厅名称相关表的信息也要更改
            await apiModel.updateCommentRestaurantName(oldName,newName);
            await apiModel.updateDishesRestaurantName(oldName,newName);
            await apiModel.updateLikesRestaurantName(oldName,newName);
            await apiModel.updateOrderDishesRestaurantName(oldName,newName);
            await apiModel.updateOrdersRestaurantName(oldName,newName);
            // ctx.session.user = newName;
            // ctx.redirect('/')
        })
        .catch(async () => {
            ctx.body = {
                code: 500,
                message: '修改信息失败！'
            }
        })
})
//更改餐厅密码
router.get('/password', async(ctx, next) => {
    await checkRestaurant(ctx)
    await ctx.render('password')
})
router.post('/password', koaBody(), async(ctx, next) => {
    var {oldPassword, newPassword} = ctx.request.body
    await apiModel.findRestaurant(ctx.session.user)
        .then(async (res) => {
            if (res[0]['password'] === oldPassword) {
                await apiModel.updateRestaurantPassword(ctx.session.user, newPassword)
                    .then((res) => {
                        ctx.session.pass = newPassword;
                        ctx.redirect('/')
                    })
                    .catch(res => {
                        ctx.body = {
                            code:500,
                            message:'修改密码失败！'
                        }
                    })
            }else{
                ctx.body = {
                    code:300,
                    message:'原密码错误！'
                }
            }
        })
        .catch(res => {
            ctx.body = {
                code:404,
                message:'修改密码失败！'
            }
        })
})
// 上传dish数据
router.get('/upload', async(ctx, next) => {
    await checkLogin(ctx)
    await checkRestaurant(ctx)
    await ctx.render('upload', {
        session: ctx.session
    })
})
// 上传dish数据 post
router.post('/upload', koaBody({
    multipart: true,
    "formLimit":"5mb",
    "jsonLimit":"5mb",
    "textLimit":"5mb",
    formidable: {
        uploadDir: './public/images'
    }
}), async(ctx, next) => {
   await apiModel.getRestaurantIdByName([ctx.session.user])
       .then(async (res) => {
           const restaurantId = res[0]['id'];
           var i_body = Object.assign({}, ctx.request.body)
           console.log('i_body', i_body)
           let {dishName, dishType, dishStar, endTime, discount, quantity, price, dishDetail} = i_body['fields']
           var img = i_body['files']['file']['path']
           var data = [dishName, ctx.session.user, moment().format('YYYY-MM-DD HH:mm'), endTime, discount, quantity,
               img.match(/\w+/g)[2], dishType, price, dishDetail, dishStar,restaurantId]
           console.log(data)
           await apiModel.insertData(data)
               .then((res) => {
                   ctx.body = {
                       code: 200,
                       message: '上传成功'
                   }
               })
           .catch(res => {
               ctx.body = {
                   code: 500,
                   message: '上传失败'
               }
           })
       })
    .catch(err => {
        ctx.body = {
            code: 500,
            message: '获取餐厅编号失败！'
        }
    })
})
// 编辑页面
router.get('/edit/:id', async(ctx, next) => {
    // console.log('params.id', ctx.params.id)
    await checkRestaurant(ctx)
    await apiModel.findDataById(ctx.params.id)
        .then(res => {
            data = JSON.parse(JSON.stringify(res))
        })
    await ctx.render('edit', {
        dish: data[0],
        session: ctx.session
    })
})
// 编辑 post
router.post('/edit/:id', koaBody({
    multipart: true,
    "formLimit":"5mb",
    "jsonLimit":"5mb",
    "textLimit":"5mb",
    formidable: {
        uploadDir: './public/images'
    }
}), async(ctx, next) => {
    var i_body = Object.assign({}, ctx.request.body)
    console.log('i_body', i_body)
    let {
         dishName,
         dishType,
         dishStar,
         discount,
         endTime,
         quantity,
         price,
         dishDetail,
    } = i_body['fields'];
    let img = ''
    if (Object.keys(i_body['files']).length == 0){
        img = file
    }else{
        img = i_body['files']['newFile']['path'].match(/\w+/g)[2]
    }
    var data = [dishName,dishType,dishStar, img, discount,endTime,
        quantity, price, dishDetail, ctx.params.id]
    console.log(data)
    // 更改菜肴信息，喜欢和评论的列表也要相应更新，比如dishName
    await apiModel.updateLikeName([dishName, ctx.params.id])
    await apiModel.updateCommentName([dishName, ctx.params.id])
    await Promise.all([
            apiModel.updateDataHasImg(data),
            apiModel.updateLikesImg([img,ctx.params.id])
        ])
        .then(() => {
            console.log('更新成功')
            ctx.body = {
                code:200,
                message:'修改成功'
            }
        })
        .catch(e=>{
            ctx.body = {
                code: 500,
                message: '修改失败'
            }
        })
})
// 删除
router.post('/delete/:id', koaBody(), async(ctx, next) => {
    await checkRestaurant(ctx)
    await apiModel.deleteDishes(ctx.params.id)
        .then(() => {
            ctx.body = 'success'
        }).catch((err) => {
            // console.log(err)
        })
})
// 批准消息
router.post('/agreeMessage/:id', koaBody(), async(ctx, next) => {
    await checkRestaurant(ctx)
    await apiModel.agreeMessage(ctx.params.id)
        .then(() => {
            ctx.body = 'success'
        }).catch((err) => {
            // console.log(err)
        })
})
// 删除消息
router.post('/deleteMessage/:id', koaBody(), async(ctx, next) => {
    await checkRestaurant(ctx)
    await apiModel.deleteMessage(ctx.params.id)
        .then(() => {
            ctx.body = 'success'
        }).catch((err) => {
            // console.log(err)
        })
})
// 餐厅列表,仅管理员可见
router.get('/restaurant',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await checkAdmin(ctx)
    await apiModel.findData('restaurant').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('restaurant', page, 15).then(res => {
        data = res
    })
    await ctx.render('restaurant', {
        restaurant: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage:  parseInt(page)
    })
})
// 手机端用户列表,仅管理员可见
router.get('/mobileUser',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await checkAdmin(ctx)
    await apiModel.findData('mobileUser').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('mobileUser',page,10).then(res=>{
        data = res
    })
    await ctx.render('mobileUser',{
        users:data,
        session:ctx.session,
        dataLength: Math.ceil(dataLength / 10),
        nowPage:  parseInt(page)
    })
})
// 手机端评论列表
router.get('/comment',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('comments').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('comments', page, 15).then(res => {
        data = res
    })
    // console.log(dataLength)
    await ctx.render('comments', {
        comments: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage:  parseInt(page)
    })
})
// 手机端like列表
router.get('/like',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('likes').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('likes', page, 15).then(res => {
        data = res
    })
    await ctx.render('likes', {
        likes: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage: parseInt(page)
    })
})
// 消息列表
router.get('/message',async(ctx,next)=>{
    var page,
        dataLength = '';
    var restaurantName = '';
    if (ctx.session.user) {
        restaurantName = ctx.session.user
    } else {
        await ctx.render('signin')
    }
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findMessage(restaurantName).then(res => {
        dataLength = res.length
    })
    await apiModel.findMessagePageData(page, 15, restaurantName).then(res => {
        data = res
    })
    await ctx.render('message', {
        messages: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage: parseInt(page)
    })
})
// 查看点餐统计信息，仅餐厅可见
router.get('/orderDish',async(ctx,next)=>{
    var page,
        dataLength = '';
    var restaurantName = '';
    if (ctx.session.user) {
        restaurantName = ctx.session.user
    } else {
        await ctx.render('signin')
    }
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await checkRestaurant(ctx)
    await apiModel.getRestaurantOrder(restaurantName).then(res => {
        dataLength = res.length
    })
    await apiModel.getRestaurantOrderPageData(page, 15, restaurantName).then(res => {
        data = res
    })

    await ctx.render('orderDish', {
        orderDishes: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage: parseInt(page)
    })
})
// 查看退订统计信息，仅餐厅可见
router.get('/backOrder',async(ctx,next)=>{
    var page,
        dataLength = '';
    var restaurantName = '';
    if (ctx.session.user) {
        restaurantName = ctx.session.user
    } else {
        await ctx.render('signin')
    }
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await checkRestaurant(ctx)
    await apiModel.getRestaurantBackOrder(restaurantName).then(res => {
        dataLength = res.length
    })
    await apiModel.getRestaurantBackOrderPageData(page, 15, restaurantName).then(res => {
        data = res
    })

    await ctx.render('backOrder', {
        backOrders: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage: parseInt(page)
    })
})
// 查看财务情况
router.get('/profit',async(ctx,next)=>{
    var page,
        dataLength = '';
    var restaurantName = '';
    if (ctx.session.user) {
        restaurantName = ctx.session.user
    } else {
        await ctx.render('signin')
    }
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    if(restaurantName==='admin'){
        await apiModel.getProfitAdmin().then(res => {
            dataLength = res.length
        })
        await apiModel.getProfitPageDataAdmin(page, 15).then(res => {
            data = res
        })
    }else{
        await apiModel.getProfit(restaurantName).then(res => {
            dataLength = res.length
        })
        await apiModel.getProfitPageData(page, 15, restaurantName).then(res => {
            data = res
        })
    }
    await ctx.render('profit', {
        profits: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage: parseInt(page)
    })
})
module.exports = router
