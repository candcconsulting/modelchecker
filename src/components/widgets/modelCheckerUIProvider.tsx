import * as React from 'react';
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from '@itwin/appui-abstract';
import { checkBS1192 } from '../../rules/checkBS1192';
import { checkUniclass } from '../../rules/checkUniclass';
import { checkHS2 } from '../../rules/checkHS2';
import { checkEquipment } from '../../rules/checkequipment';
import { checkProperty } from '../../rules/checkProperty';
import { checkSpaces } from '../../rules/checkSpaces';
import { Checkbox, ProgressRadial } from '@itwin/itwinui-react';
import { useState } from 'react';
  
type progressStatus = 'positive' | 'negative' | undefined


  const ModelCheckerWidget = () => {
    const [checkPropertyRadial, setCheckPropertyRadial] = useState(0);
    const [checkPropertyStatus, setCheckPropertyStatus] = useState(undefined as progressStatus);

    function updateCheckPropertyStatus(value : number) {
      setCheckPropertyRadial(value);
    }
    return (
      <span>
        <span>Model Check</span><br></br>
          <button className = "button" onClick = {() => checkBS1192()}>Check BS1192</button>

        <br></br>
        <button className = "button" onClick = {() => checkUniclass()}>Check Uniclass</button>
        <br></br>
        <button className = "button" onClick = {() => checkHS2()}>Check HS2</button>
        <Checkbox label="System"></Checkbox><Checkbox label="Product"></Checkbox>
        <br></br>
        <button className = "button" onClick = {() => checkEquipment()}>Check JunctionBox</button>
        <br></br>
        <div className="flexbox-container">
          <ProgressRadial value={checkPropertyRadial} status = {checkPropertyStatus}></ProgressRadial>
          <button className = "button" onClick = {() => checkProperty(updateCheckPropertyStatus)}>Check Property</button>
        </div>
        <br></br>
        <button className = "button" onClick = {() => checkSpaces()}>Check Spaces</button>
        <br></br>
      </span>
    )
  }

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
            return <ModelCheckerWidget></ModelCheckerWidget>;
          },
        };
  
        widgets.push(carbonWidget);
      }
  
      return widgets;
    }
  }