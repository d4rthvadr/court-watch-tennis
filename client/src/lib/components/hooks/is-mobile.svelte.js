import { browser } from '$app/environment';

export class IsMobile {
	current = $state(false);

	constructor() {
		if (browser) {
			this.current = window.innerWidth < 768;

			const handleResize = () => {
				this.current = window.innerWidth < 768;
			};

			window.addEventListener('resize', handleResize);

			// Cleanup
			$effect(() => {
				return () => {
					window.removeEventListener('resize', handleResize);
				};
			});
		}
	}
}
