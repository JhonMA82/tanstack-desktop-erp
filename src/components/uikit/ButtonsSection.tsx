import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";

/** Every button variant, size and state in one place. */
export function ButtonsSection() {
  return (
    <Panel title="Buttons">
      <div className="flex flex-col gap-3 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="default">Default</Button>
          <Button variant="primary">Save</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Delete</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small 20px</Button>
          <Button size="md">Medium 22px</Button>
          <Button variant="primary" size="sm">
            Small primary
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled>Disabled</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button>
            <Icon name="save" />
            Save file
          </Button>
          <Button variant="primary">
            <Icon name="export" />
            Export
          </Button>
          <Button size="sm" variant="danger">
            <Icon name="void" size={10} />
            Void
          </Button>
        </div>
      </div>
    </Panel>
  );
}
