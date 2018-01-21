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
					n_data = {
						from: data.from,
						to: data.to,
						duration: data.duration,
						link: data.link,
						text: w_name,
						date: date_now,
						name: 'Анатолий'
					};
					/* Делаем проверку, существует ли ID контакта, совершающего входящий вызов */
        if (n_data.id > 0){     //Если ID существует, формируем ссылку на данный контакт в amoCRM
        	text = 'Вам звонит: '+n_data.name+'</br><a href="/contacts/detail/'+ n_data.id+'"> Перейти в карту контакта</a>';
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
      var notifications_data = {};
      $.get('//'+window.location.host+'/private/api/contact_search.php?SEARCH=+79991112233', function(res){
      	console.log(res);
      	notifications_data.id = res.getElementsByTagName('id')[0].innerHTML;
      	notifications_data.from = res.getElementsByTagName('name')[0].innerHTML;
      	// notify_data.company = $(res).find('root > contacts > contact > company > name').eq(0).text();
      	notifications_data.to = 'Анатолий Моляков';
      });
      self.add_call_notify(notifications_data);
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

    },
    contacts: {
					//select contacts in list and clicked on widget name
					selected: function(){
						console.log('contacts');
					}
				},
				leads: {
					//select leads in list and clicked on widget name
					selected: function(){
						console.log('leads');
					}
				},
				tasks: {
					//select taks in list and clicked on widget name
					selected: function(){
						console.log('tasks');
					}
				}
			};
			return this;
		};

		return CustomWidget;
	});
