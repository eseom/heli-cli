//@flow

import {Heli} from 'heli';

const heli = Heli.instance();

heli.route({
  path: '/',
  method: 'GET',
  handler: function (request, reply) {
    reply({result: 'hello world'});
  }
});

heli.start();
