$(function(){
  $('select.dropdown').dropdown()
  function redirect() {
    window.location.href='/'
  }
  $('.ui.form')
  .form({
    inline : true,
    on  : 'blur',
    onSuccess: redirect
     ,
    fields: {
      name: {
        identifier: 'dish-name',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入名称！'
          }
        ]
      },
      endtime: {
        identifier: 'dish-endtime',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入到期时间！'
          }
        ]
      },
      file: {
        identifier: 'file',
        rules: [
          {
            type   : 'empty',
            prompt : '请上传图片！'
          }
        ]
      },
      discount: {
        identifier: 'dish-discount',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入折扣！'
          }
        ]
      },
      type: {
        identifier: 'dish-type',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入类型！'
          }
        ]
      },
      price: {
        identifier: 'dish-price',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入价格！'
          }
        ]
      },
      quantity: {
        identifier: 'dish-quantity',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入数量！'
          }
        ]
      },
      detail: {
        identifier: 'dish-detail',
        rules: [
          {
            type   : 'empty',
            prompt : '请输入描述！'
          }
        ]
      },
    }
  })
;
})
