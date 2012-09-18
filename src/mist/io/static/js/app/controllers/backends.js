define('app/controllers/backends', [
    'app/models/backend',
    'ember'
    ],
    /**
     * Backends controller
     *
     * @returns Class
     */
    function(Backend) {
        return Ember.ArrayController.extend({
            content: [],
            machineCount: 0,
            imageCount: 0,
            // TODO make this property dynamic according to all backends states
            state: "wait",

            getMachineCount: function(){
                var count = 0;
                this.content.forEach(function(item){
                    count = count + item.machines.get('length');
                });
                this.set('machineCount', count);
            },

            getSelectedMachineCount: function() {
                var count = 0;
                this.content.forEach(function(item){
                    count = count + item.machines.filterProperty('selected', true).get('length');
                });
                this.set('selectedMachineCount', count);
            },

            getImageCount: function() {
                var count = 0;
                this.content.forEach(function(item){
                    count = count + item.images.get('length');
                });
                this.set('imageCount', count);
            },

            init: function() {
                this._super();

                var that = this;

                that.addObserver('length', function() {
                    that.getMachineCount();
                    that.getSelectedMachineCount();
                    that.getImageCount();
                });

                Ember.run.next(function(){
                $.getJSON('/backends', function(data) {
                    data.forEach(function(item){
                        that.pushObject(Backend.create(item));
                    });
                    that.content.forEach(function(item){
                        item.machines.addObserver('length', function() {
                            that.getMachineCount();
                        });

                        item.machines.addObserver('@each.selected', function() {
                            that.getSelectedMachineCount();
                        });

                        item.images.addObserver('length', function() {
                            that.getImageCount();
                        });

                        item.addObserver('state', function(){
                            var waiting = false;
                            var state = "ok";

                            that.content.forEach(function(backend){
                                if(backend.state == 'wait'){
                                    waiting = true;
                                } else if(backend.state == 'offline'){
                                    state = 'error';
                                } else if(backend.state == 'off'){
                                    state = 'down';
                                }
                            });

                            if(waiting){
                                state = 'state-wait-' + state;
                            } else {
                                state = 'state-' + state;
                            }
                            info('setting backends state: ' + state);
                            that.set('state', state);
                        });
                    });
                }).error(function() {
                    Mist.notificationController.notify("Error loading backends");
                });
                });
            }
        });
    }
);
