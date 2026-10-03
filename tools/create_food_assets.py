"""Compatibility entry point for the current, remodeled Blender asset pack."""
import os
import runpy

runpy.run_path(os.path.join(os.path.dirname(__file__), 'remodel_food_assets.py'), run_name='__main__')
