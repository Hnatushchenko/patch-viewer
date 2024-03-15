import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Diff2HtmlUI } from 'diff2html/lib/ui/js/diff2html-ui';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly topPositionToStartShowingScrollButton = 100;
  private readonly subscription: Subscription = new Subscription();

  isScrollToTopButtonShown: boolean = false;
  form = this.formBuilder.group({
    diffStringControl: '',
  });

  get diffStringControl() {
    return this.form.controls.diffStringControl;
  }

  @ViewChild('diff2html')
  diff2html!: ElementRef;

  constructor(private readonly formBuilder: FormBuilder) {}

  ngAfterViewInit() {
    this.subscribeToDiffStringChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('window:scroll')
  checkScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrollToTopButtonShown = scrollPosition >= this.topPositionToStartShowingScrollButton;
  }

  private subscribeToDiffStringChanges() {
    this.subscription.add(
      this.diffStringControl.valueChanges
        .pipe(
          map(diffString => diffString ?? ''),
          debounceTime(250)
        )
        .subscribe(diffString => {
          const diff2htmlUi = new Diff2HtmlUI(this.diff2html.nativeElement, diffString);
          diff2htmlUi.draw();
        })
    );
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
}
