import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterplanetarySpace } from './interplanetary-space';

describe('InterplanetarySpace', () => {
  let component: InterplanetarySpace;
  let fixture: ComponentFixture<InterplanetarySpace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterplanetarySpace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterplanetarySpace);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
