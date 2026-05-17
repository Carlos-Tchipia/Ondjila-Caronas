import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPanel } from './map-panel';

describe('MapPanel', () => {
  let component: MapPanel;
  let fixture: ComponentFixture<MapPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(MapPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
