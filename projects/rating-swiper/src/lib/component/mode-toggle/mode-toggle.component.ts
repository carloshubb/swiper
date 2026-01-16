/**
 * Mode Toggle Component
 * Provides UI to toggle between TEST and STORE modes
 * 
 * Client Requirement: "Verify that the system is working correctly when toggling
 * between TEST and STORE modes for storing and tracking labelling data"
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModeService, DataMode } from '../../services/mode.service';

@Component({
    selector: 'lib-mode-toggle',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="mode-toggle">
            <label class="switch">
                <input 
                    type="checkbox" 
                    [checked]="(mode$ | async) === dataMode.STORE"
                    (change)="toggleMode()"
                    aria-label="Toggle between TEST and STORE modes"
                >
                <span class="slider">
                    <span class="mode-label">
                        {{ (mode$ | async) === dataMode.TEST ? '🧪 TEST' : '💾 STORE' }}
                    </span>
                </span>
            </label>
            <div class="mode-description">
                <ng-container *ngIf="(mode$ | async) === dataMode.TEST">
                    <strong>TEST Mode:</strong> Data logged locally (not saved to database)
                </ng-container>
                <ng-container *ngIf="(mode$ | async) === dataMode.STORE">
                    <strong>STORE Mode:</strong> Data saved to database for ML training
                </ng-container>
            </div>
        </div>
    `,
    styles: [`
        .mode-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            min-width: 200px;
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 140px;
            height: 40px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            transition: all 0.4s ease;
            border-radius: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .slider:hover {
            transform: scale(1.02);
            box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
        }
        
        input:checked + .slider {
            background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
        }
        
        input:checked + .slider:hover {
            box-shadow: 0 2px 8px rgba(81, 207, 102, 0.4);
        }
        
        .mode-label {
            color: white;
            font-weight: 600;
            font-size: 15px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        .mode-description {
            margin-top: 12px;
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }
        
        .mode-description strong {
            color: #333;
            display: block;
            margin-bottom: 2px;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
            .mode-toggle {
                top: 10px;
                right: 10px;
                padding: 12px;
                min-width: 180px;
            }
            
            .switch {
                width: 120px;
                height: 36px;
            }
            
            .mode-label {
                font-size: 13px;
            }
            
            .mode-description {
                font-size: 11px;
            }
        }
    `]
})
export class ModeToggleComponent {
    mode$ = this.modeService.getMode();
    dataMode = DataMode; // Expose enum to template

    constructor(private modeService: ModeService) {
        console.log('🎨 ModeToggleComponent initialized');
    }

    toggleMode(): void {
        this.modeService.toggleMode();
    }
}
