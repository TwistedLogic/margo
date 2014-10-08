$(function() {
    var HOST = 'http://margot.fubles.com',
        STORAGE_USER_KEY = 'margot.user';

    var AppViewModel = function() {
        var self = this;

        self.host = HOST;
        self.user = ko.observable();
        self.days = ko.observableArray();
        self.users = ko.observableArray();
        self.week = ko.observable(moment().startOf('week'));

        self.setUser = function(user) {
            self.user(user);
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(self.user()));
            getWeek();
        };

        self.formattedWeek = ko.computed(function() {
            return moment(self.week()).add(1, 'day').format('MMM Do') + ' - ' +
                moment(self.week()).endOf('week').subtract(1, 'day').format('MMM Do');
        });

        self.previousWeek = function() {
            self.week(self.week().subtract(1, 'week'));
            getWeek();
        };

        self.nextWeek = function() {
            self.week(self.week().add(1, 'week'));
            getWeek();
        };

        self.deleteDish = function(dish) {
            if (confirm("Really want to delete the dish \"" + dish.name + "\"?")) {
                $.post(HOST + "/api/dishes/" + dish._id, {
                    token: self.user().token
                })
                    .success(function() {
                        var days = self.days();

                        for (var i = 0; i < days.length; i++) {
                            days[i].dishes.remove(function(elem) {
                                return elem._id === dish._id;
                            })
                        }
                    }).error(function(jqXHR) {
                        alert(jqXHR.responseText);
                    });
            }
        };

        self.addDish = function(form) {
            var $form = $(form),
                $name = $form.find('input[name="name"]'),
                name = $name.val();

            if ($.trim(name).length != 0) {
                var dish = {
                    name: name,
                    year: self.week().format('YYYY'),
                    week: self.week().format('w'),
                    day: $name.data('day'),
                    token: self.user().token
                };

                $.post(HOST + "/api/dishes", dish).success(function() {
                    self.days()[dish.day - 1].dishes.push(dish);
                    $name.val('');
                }).error(function(jqXHR) {
                    alert(jqXHR.responseText);
                });
            }
        };

        self.toggleTicket = function (ticket, e) {
            var $target = $(e.target),
                day = $target.data('day'),
                active = $target.hasClass('active'),
                parent = $target.data('parent');

            if (parent !== self.user().name || self.week().week() <= moment().week()) {
                return;
            }

            if (active) {
                $.post(HOST + "/api/tickets/" + ticket, {
                    token: self.user().token
                }).success(function() {
                    var users = self.users();

                    for (var i = 0; i < users.length; i++) {
                        if (users[i].name === self.user().name) {
                            users[i].tickets[day - 1](false);
                        }
                    }
                }).error(function(jqXHR) {
                    alert(jqXHR.responseText);
                });
            } else {
                $.post(HOST + "/api/tickets", {
                    token: self.user().token,
                    day: day,
                    year: self.week().format('YYYY'),
                    week: self.week().format('w')
                })
                    .success(function(res) {
                        var users = self.users();

                        for (var i = 0; i < users.length; i++) {
                            if (users[i].name === self.user().name) {
                                users[i].tickets[day - 1](res.ticket._id);
                            }
                        }
                    }).error(function(jqXHR) {
                        alert(jqXHR.responseText);
                    });
            }
        };

        function getWeek() {
            $.getJSON(HOST + '/api/week', {
                token: self.user().token,
                year: self.week().format('YYYY'),
                week: self.week().format('w')
            }, function(res) {
                var days = [
                    { name: 'Monday', dishes: ko.observableArray() },
                    { name: 'Tuesday', dishes: ko.observableArray() },
                    { name: 'Wednesday', dishes: ko.observableArray() },
                    { name: 'Thursday', dishes: ko.observableArray() },
                    { name: 'Friday', dishes: ko.observableArray() }
                ];

                if (res.success) {
                    for (var i = 0; i < res.dishes.length; i++) {
                        var dish = res.dishes[i];

                        days[dish.day-1].dishes.push(dish);
                    }
                } else {
                    alert(res.message);
                }

                self.days(days);

                for (i = 0; i < res.users.length; i++) {
                    for (var j = 0; j < res.users[i].tickets.length; j++) {
                        res.users[i].tickets[j] = ko.observable(res.users[i].tickets[j]);
                    }
                }

                self.users(res.users);
            });
        }
    };

    var appViewModel = new AppViewModel();
    ko.applyBindings(appViewModel);

    $('#login-form').ajaxForm({
        success: function(res) {
            if (!res.success) {
                alert(res.message);

                return;
            }

            appViewModel.setUser(res.user);
        }
    });

    $('#main').on('click', '#logout', function() {
        localStorage.removeItem(STORAGE_USER_KEY);
        appViewModel.user(null);

        return false;
    }).on('focusout', 'form.add-dish input', function() {
        $(this).closest('form').submit();
    });

    var user = localStorage.getItem(STORAGE_USER_KEY);

    if (user) {
        appViewModel.setUser(JSON.parse(user));
    }
});
