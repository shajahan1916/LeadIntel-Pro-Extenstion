class EventBus {

  constructor() {

    this.events = new Map();
  }

  on(
    eventName,
    listener
  ) {

    if (
      typeof listener !== "function"
    ) {

      throw new Error(
        "Listener must be a function"
      );
    }

    if (
      !this.events.has(eventName)
    ) {

      this.events.set(
        eventName,
        new Set()
      );
    }

    this.events
      .get(eventName)
      .add(listener);

    return () => {

      this.off(
        eventName,
        listener
      );
    };
  }

  once(
    eventName,
    listener
  ) {

    const wrapper = (payload) => {

      listener(payload);

      this.off(
        eventName,
        wrapper
      );
    };

    this.on(
      eventName,
      wrapper
    );
  }

  off(
    eventName,
    listener
  ) {

    if (
      !this.events.has(eventName)
    ) {
      return;
    }

    this.events
      .get(eventName)
      .delete(listener);

    if (
      this.events
        .get(eventName)
        .size === 0
    ) {

      this.events.delete(
        eventName
      );
    }
  }

  emit(
    eventName,
    payload = null
  ) {

    if (
      !this.events.has(eventName)
    ) {
      return;
    }

    for (
      const listener of this.events.get(
        eventName
      )
    ) {

      try {

        listener(payload);

      } catch (error) {

        console.error(
          `Event listener failed for ${eventName}`,
          error
        );
      }
    }
  }

  clear(eventName = null) {

    if (eventName) {

      this.events.delete(
        eventName
      );

      return;
    }

    this.events.clear();
  }

  listenerCount(eventName) {

    if (
      !this.events.has(eventName)
    ) {

      return 0;
    }

    return this.events
      .get(eventName)
      .size;
  }

  hasListeners(eventName) {

    return this.listenerCount(
      eventName
    ) > 0;
  }

  eventNames() {

    return [
      ...this.events.keys()
    ];
  }
}

const eventBus =
  new EventBus();

export default eventBus;