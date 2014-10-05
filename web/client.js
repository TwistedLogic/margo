$(function() {
    var AppViewModel = function() {
        var self = this;

        self.user = ko.observable();
        self.users = ko.observableArray([]);
        self.days = ko.observableArray([]);
        self.week = ko.observable(moment().startOf('week'));

        self.setUser = function(user) {
            self.user(user);
            localStorage.setItem('user', JSON.stringify(self.user()));
            self.fetchUsers();
            self.updateDishes();
        };

        self.fetchUsers = function() {
            $.getJSON('http://margo.fubles.com:8080/api/users', function(res) {
                if (res.success) {
                    appViewModel.users(res.users);
                }
            });
        };

        self.updateDishes = function() {
            $.getJSON('http://margo.fubles.com:8080/api/dishes', {
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
            });
        };

        self.formattedWeek = ko.computed(function() {
            return moment(self.week()).add(1, 'day').format('MMM Do') + ' - ' +
                moment(self.week()).endOf('week').subtract(1, 'day').format('MMM Do');
        });

        self.previousWeek = function() {
            self.week(self.week().subtract(1, 'week'));
            self.updateDishes();
        };

        self.nextWeek = function() {
            self.week(self.week().add(1, 'week'));
            self.updateDishes();
        };

        self.deleteDish = function(dish) {
            if (confirm("Really want to delete the dish \"" + dish.name + "\"?")) {
                $.post("http://margo.fubles.com:8080/api/dishes/" + dish._id, {
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

                $.post("http://margo.fubles.com:8080/api/dishes", dish).success(function() {
                    self.days()[dish.day - 1].dishes.push(dish);
                    $name.val('');
                }).error(function(jqXHR) {
                    alert(jqXHR.responseText);
                });
            }
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
        localStorage.setItem('user', null);
        appViewModel.user(null);

        return false;
    });

    $('#main').on('focusout', 'form.add-dish input', function() {
        $(this).closest('form').submit();
    });

    var user = localStorage.getItem('user');

    if (user) {
        appViewModel.setUser(JSON.parse(user));
        appViewModel.fetchUsers();
        appViewModel.updateDishes();
    }
});
