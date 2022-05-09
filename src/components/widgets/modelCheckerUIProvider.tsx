import * as React from 'react';
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from '@itwin/appui-abstract';
import { checkBS1192 } from '../../rules/checkBS1192';
import { checkUniclass } from '../../rules/checkUniclass';
import { checkHS2 } from '../../rules/checkHS2';
import { checkEquipment } from '../../rules/checkequipment';
import { checkProperty } from '../../rules/checkProperty';
import { checkSpaces } from '../../rules/checkSpaces';
import { Button, Checkbox } from '@itwin/itwinui-react';
  
  export class ModelCheckerUIProvider implements UiItemsProvider {
  
    public readonly id = 'ModelCheckerUIProviderId';
  
    public provideWidgets(
      stageId: string,
      stageUsage: string,
      location: StagePanelLocation,
      section?: StagePanelSection
    ): ReadonlyArray<AbstractWidgetProps> {
      const widgets: AbstractWidgetProps[] = [];
  
      if (
        location === StagePanelLocation.Right &&
        section === StagePanelSection.Start
      ) {
        const carbonWidget: AbstractWidgetProps = {
          id: 'ModelCheckerUI',
          label: 'Model Checker',
          getWidgetContent() {
            return <span><span>Carbon</span><br></br>
            <Button onClick = {() => checkBS1192()}>Check BS1192</Button>
            <br></br>
            <Button onClick = {() => checkUniclass()}>Check Uniclass</Button>
            <br></br>
            <Button onClick = {() => checkHS2()}>Check HS2</Button>
            <Checkbox label="System"></Checkbox><Checkbox label="Product"></Checkbox>
            <br></br>
            <Button onClick = {() => checkEquipment()}>Check JunctionBox</Button>
            <br></br>
            <Button onClick = {() => checkProperty()}>Check Property</Button>
            <br></br>
            <Button onClick = {() => checkSpaces()}>Check Spaces</Button>
            <br></br>
            </span>;
          },
        };
  
        widgets.push(carbonWidget);
      }
  
      return widgets;
    }
  }