import { EventEmitter } from "events";

class PokerEngineEvents extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Set a reasonable limit for the number of listeners
  }
}

export default PokerEngineEvents;
