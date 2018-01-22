define(['jquery', 'lib/components/base/modal'], function($, Modal){
	var CustomWidget = function () {
		var self = this;

		this.call_result = function() {
				/* Составляем разметку формы вводы данных, которая будет отображаться в модальном окне */
				var data = [];
				data.push('<style type="text/css" style="display: none">'+
					'input[type="text"] {'+
					'border: 1px solid #696969;'+
					'border-radius: 3px;'+
					'-webkit-border-radius: 3px; //закругление углов (Google Chrome)'+
					'-moz-border-radius: 3px; //закругление углов (FireFox)'+
					'margin: 2px;'+
					'padding: 2px'+
					'}'+
					'input[type=submit] {'+
					'background-color: #20B2AA;'+
					'border: 1px #008B8B;'+
					'border-radius: 3px;'+
					'padding: 3px'+
					'}'+
					'</style>'+
					'<form method="post" name="lead_data" id="call_result_data">'+
					'<label for="inputs">Результат звонка +7(999)888-77-66</label><br><br>' +
					'<div id="inputs">'+
					'<input id="contact" type="text" name="contact_name" placeholder="Имя контакта"><br><br>'+
					'<input id="lead" type="text" name="lead_name" placeholder="Название сделки"><br><br>'+
					'<input id="lead_note" type="text" name="note" placeholder="Примечание"><br><br>'+
					'<label for="lead_task">Тип задачи</label><br>'+
					'<select name="task_type">'+
					'<option value=1>Связаться с клинетом</option>'+
					'<option value=2>Звонок</option>'+
					'<option value=3>Встреча</option>'+
					'<option value=4>Письмо</option>'+
					'</select><br><br>'+
					'<label for="lead_task_text">Поставить задачу</label><br>'+
					'<input id="lead_task_text" type="text" name="text" placeholder="Комментарий к задаче"><br><br>'+
					'</div>'+
					'<input type="submit" value="Сохранить">'+
					'</form>');
				modal = new Modal({
					class_name: 'modal-window',
					init: function ($modal_body) {
						$modal_body
			      .trigger('modal:loaded') //запускает отображение модального окна
			      .html(data)
			      .trigger('modal:centrify')  //настраивает модальное окно
			      .append('<span class="modal-body__close">Отмена</span>');
			    },
			    destroy: function () {
			    }
			  });
				$('#call_result_data input[type="submit"]').click(function(e) {
					e.preventDefault();
					var data;   // переменная, которая будет содержать данные серилизации
					data = $(this).parent('form').serializeArray();
					setTimeout('$(".modal-body__close").trigger("click")',1000);
					if(data[1]['value'] != ""){
						var lead_data = [];
						lead_data = {
							"request":  {
								"leads":  {
									"add":  [{
										"name":data[1]['value']
									}]
								}
							}
						};
						$.post('https://cnst.amocrm.ru/private/api/v2/json/leads/set', lead_data, function(response) {
							var lead_id = response.response.leads.add[0].id;
							if(lead_id != 0) {
								if(data[0]['value'] != ""){
									var contact_data = [],
									task_data = [],
									note_data = [];
									contact_data  = {
										"request":  {
											"contacts":  {
												"add":  [{
													"name":data[0]['value'],
													"linked_leads_id": lead_id
												}]
											}
										}
									};
									$.post('https://cnst.amocrm.ru/private/api/v2/json/contacts/set', contact_data, function(response) {
										var contact_id = response.response.contacts.add[0].id;
									}, 'json');}
									if(data[3]['value'] != ""){
										task_data = {
											"request":  {
												"tasks":  {
													"add":  [{
														"element_id":  lead_id,
														"element_type":  2,
														"task_type": data[3]['value'],
														"text":  data[4]['value']
													}]
												}
											}
										};
										$.post('https://cnst.amocrm.ru/private/api/v2/json/tasks/set', task_data, function(response) {}, 'json');
									}
									if(data[2]['value'] != ""){
										note_data = {
											"request":  {
												"notes":  {
													"add":  [{
														"element_id":  lead_id,
														"element_type":  2,
														"note_type":  4,
														"text":  data[2]['value']
													}]
												}
											}
										};
										$.post('https://cnst.amocrm.ru/private/api/v2/json/notes/set', note_data, function(response) {}, 'json');
									}
								}
							}, 'json');
					}
				});
			};

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
      		if (res.getElementsByTagName('contact').length != 0) {
      			var data_id = res.getElementsByTagName('id')[0].innerHTML;
      			notifications_data.name = res.getElementsByTagName('contact')[0].children[1].innerHTML;
      			notifications_data.from = res.getElementsByTagName('phones')[0].children[0].children[0].innerHTML;
      			notifications_data.to = res.getElementsByTagName('user')[0].children[1].innerHTML;
      			notifications_data.element = { id: data_id, type: "contact" };
      			notifications_data.duration = 60;
      			notifications_data.link = 'https://example.com/dialog.mp3';
      			notifications_data.text = 'Example text';
      			self.add_call_notify(notifications_data);
      		} else {
      			console.log('No contact with this phone number');
      		}
      	});
      };
      self.make_call();
    },
    bind_actions: function(){
    	setTimeout(self.call_result,30000); //устанавливаем задержку вызова функции результата звонка
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
