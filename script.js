define(['jquery'], function($){
	var CustomWidget = function () {
		var self = this;
		this.callbacks = {
			render: function(){
				return true;
			},
			init: function() {
				$.get('//'+window.location.host+'/private/api/contact_search.php?SEARCH=+79991112233', function(res){
					console.log(res);
				});
				self.add_action('phone', function(data) {
					self.crm_post (
						'http://localhost/amophone/file.php',
						{
							call_to: data.value
						},
						function (msg) {
							alert('Данные отправлены');
						},
						'text',
						function() {
							alert('Error');
						}
						);
				});
				self.add_call_notify = function(data){
					var w_name = self.i18n('widget').name,
					date_now = Math.ceil(Date.now()/1000),
					lang = self.i18n('settings'),
					text,
					n_data = {
						name: data.name,
						from: data.from,
						to: data.to,
						duration: data.duration,
						link: data.link,
						text: w_name+': '+ data.text,
						date: date_now,
						element: data.element
					};
					/* Делаем проверку, существует ли ID контакта, совершающего входящий вызов */
        if (n_data.element.id > 0){     //Если ID существует, формируем ссылку на данный контакт в amoCRM
        	text = 'Вам звонит: '+n_data.name+'</br><a href="/contacts/detail/'+ n_data.element.id+'"> Перейти в карту контакта</a>';
        	n_data.text = text;
        	n_data.from = data.from;
        	if (n_data.from.length < 4){   //Проверка на внутренний номер
        		n_data.header = 'Внутренний номер: '+data.from+'';
        	}
        	else {
        		n_data.header = 'Входящий вызов: '+data.from+'';
        	}
        }
        AMOCRM.notifications.add_call(n_data);
      };
      /* Далее данные, имитирующие поступающую информацию  */
      self.make_call = function() {
      	$.get('//'+window.location.host+'/private/api/contact_search.php?SEARCH=+79991112233', function(res){
      		console.log(res);
      		var notifications_data = {};
      		var data_id = res.getElementsByTagName('id')[0].innerHTML;
      		notifications_data.name = res.getElementsByTagName('contact')[0].children[1].innerHTML;
      		notifications_data.from = res.getElementsByTagName('phones')[0].children[0].children[0].innerHTML;
      		notifications_data.to = res.getElementsByTagName('user')[0].children[1].innerHTML;
      		notifications_data.element = { id: data_id, type: "contact" };
      		notifications_data.duration = 60;
      		notifications_data.link = 'https://example.com/dialog.mp3';
      		notifications_data.text = 'Example text';
      		self.add_call_notify(notifications_data);
      	});
      };
      self.make_call();
    },
    bind_actions: function(){
    	return true;
    },
    settings: function(){
    	return true;
    },
    onSave: function(){
    	alert('click');
    	return true;
    },
    destroy: function(){

    }
  };
  return this;
};

return CustomWidget;
});
