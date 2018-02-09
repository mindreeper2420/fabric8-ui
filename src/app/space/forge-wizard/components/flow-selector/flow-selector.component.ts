import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Broadcaster, Logger } from 'ngx-base';

@Component({
  selector: 'flow-selector',
  templateUrl: './flow-selector.component.html',
  styleUrls: ['./flow-selector.component.less']
})
export class FlowSelectorComponent {
  @Input() space: string;
  @Output('onSelect') onSelect = new EventEmitter();
  @Output('onCancel') onCancel = new EventEmitter();
  constructor(
    private broadcaster: Broadcaster
  ) {}

  select(flow: string) {
    switch (flow) {
      case 'import': {
        this.onSelect.emit({flow: flow});
        break;
      }
      case 'quickstart': {
        this.onSelect.emit({flow: flow});
        break;
      }
      default: {
        // TODO close modal and navigate;
        break;
      }
    }
  }

  cancel() {
    this.onCancel.emit({});
  }

  showAddAppOverlay(): void {
    this.broadcaster.broadcast('showAddAppOverlay', true);
  }

}
