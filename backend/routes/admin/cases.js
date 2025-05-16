const express = require('express');
const router = express.Router();

// Debug route registration
console.log('Admin cases routes registered');

// Add a simple test route
router.get('/test', (req, res) => {
    console.log('Test route accessed');
    res.json({ success: true, message: 'Cases admin route is working' });
});

const { sql, doTransaction } = require('../../database');
const { sendLog } = require('../../utils');
const { cacheCases } = require('../games/cases/functions');

// Get all cases with their versions and items
router.get('/', async (req, res) => {
    try {
        const [cases] = await sql.query(`
            SELECT c.id, c.name, c.slug, c.img, 
                   cv.id as versionId, cv.price, cv.createdAt, cv.endedAt 
            FROM cases c
            LEFT JOIN caseVersions cv ON c.id = cv.caseId
            ORDER BY c.id DESC, cv.endedAt IS NULL DESC, cv.createdAt DESC
        `);

        // Group cases by their id
        const casesMap = {};
        for (const caseData of cases) {
            if (!casesMap[caseData.id]) {
                casesMap[caseData.id] = {
                    id: caseData.id,
                    name: caseData.name,
                    slug: caseData.slug,
                    img: caseData.img,
                    versions: []
                };
            }

            // Add version if it exists
            if (caseData.versionId) {
                casesMap[caseData.id].versions.push({
                    id: caseData.versionId,
                    price: caseData.price,
                    createdAt: caseData.createdAt,
                    endedAt: caseData.endedAt,
                    isActive: caseData.endedAt === null
                });
            }
        }

        // Get all items for active case versions
        const activeVersionIds = cases
            .filter(c => c.endedAt === null)
            .map(c => c.versionId)
            .filter(id => id !== null);

        if (activeVersionIds.length > 0) {
            const [items] = await sql.query(`
                SELECT id, caseVersionId, robloxId, name, img, price, rangeFrom, rangeTo 
                FROM caseItems 
                WHERE caseVersionId IN (?)
                ORDER BY price DESC
            `, [activeVersionIds]);

            // Add items to their respective case versions
            for (const item of items) {
                for (const caseObj of Object.values(casesMap)) {
                    const version = caseObj.versions.find(v => v.id === item.caseVersionId);
                    if (version) {
                        if (!version.items) {
                            version.items = [];
                        }
                        version.items.push(item);
                    }
                }
            }
        }

        res.json(Object.values(casesMap));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Get a specific case with all versions and items
router.get('/:id', async (req, res) => {
    try {
        const [[caseData]] = await sql.query(`
            SELECT id, name, slug, img FROM cases WHERE id = ?
        `, [req.params.id]);

        if (!caseData) {
            return res.status(404).json({ error: 'CASE_NOT_FOUND' });
        }

        // Get all versions for this case with their names
        const [versions] = await sql.query(`
            SELECT id, name, price, createdAt, endedAt FROM caseVersions 
            WHERE caseId = ?
            ORDER BY endedAt IS NULL DESC, createdAt DESC
        `, [caseData.id]);

        // Add active status to each version
        versions.forEach(v => {
            v.isActive = v.endedAt === null;
        });

        // Get items for all versions with counts and statistics
        const versionIds = versions.map(v => v.id);
        
        if (versionIds.length > 0) {
            const [items] = await sql.query(`
                SELECT id, caseVersionId, robloxId, name, img, price, rangeFrom, rangeTo 
                FROM caseItems 
                WHERE caseVersionId IN (?)
                ORDER BY price DESC
            `, [versionIds]);

            // Group items by version and calculate statistics
            for (const version of versions) {
                const versionItems = items.filter(item => item.caseVersionId === version.id);
                version.items = versionItems;
                
                // Calculate version statistics
                version.stats = {
                    itemCount: versionItems.length,
                    totalValue: 0,
                    minPrice: Number.MAX_VALUE,
                    maxPrice: 0,
                    avgPrice: 0
                };
                
                // Calculate stats if there are items
                if (versionItems.length > 0) {
                    let totalPrice = 0;
                    
                    for (const item of versionItems) {
                        const itemPrice = parseFloat(item.price);
                        totalPrice += itemPrice;
                        version.stats.minPrice = Math.min(version.stats.minPrice, itemPrice);
                        version.stats.maxPrice = Math.max(version.stats.maxPrice, itemPrice);
                    }
                    
                    version.stats.totalValue = totalPrice;
                    version.stats.avgPrice = totalPrice / versionItems.length;
                    
                    // If min price is still the initial value, set to 0
                    if (version.stats.minPrice === Number.MAX_VALUE) {
                        version.stats.minPrice = 0;
                    }
                } else {
                    version.stats.minPrice = 0;
                }
                
                // Format numbers for display
                version.stats.totalValue = parseFloat(version.stats.totalValue.toFixed(2));
                version.stats.minPrice = parseFloat(version.stats.minPrice.toFixed(2));
                version.stats.maxPrice = parseFloat(version.stats.maxPrice.toFixed(2));
                version.stats.avgPrice = parseFloat(version.stats.avgPrice.toFixed(2));
            }
        }

        caseData.versions = versions;
        res.json(caseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Create a new case
router.post('/', async (req, res) => {
    const { name, slug, img } = req.body;

    if (!name || !slug || !img) {
        return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    try {
        // Check if a case with the same slug already exists
        const [[existingCase]] = await sql.query('SELECT id FROM cases WHERE slug = ?', [slug]);
        if (existingCase) {
            return res.status(400).json({ error: 'SLUG_ALREADY_EXISTS' });
        }

        // Insert the new case
        const [result] = await sql.query(
            'INSERT INTO cases (name, slug, img) VALUES (?, ?, ?)',
            [name, slug, img]
        );

        sendLog('admin', `[${req.user.id}] ${req.user.username} created a new case: ${name}`);
        
        res.status(201).json({
            id: result.insertId,
            name,
            slug,
            img
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Update a case
router.put('/:id', async (req, res) => {
    const { name, slug, img } = req.body;
    const { id } = req.params;

    if (!name || !slug || !img) {
        return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    try {
        // Check if case exists
        const [[existingCase]] = await sql.query('SELECT id FROM cases WHERE id = ?', [id]);
        if (!existingCase) {
            return res.status(404).json({ error: 'CASE_NOT_FOUND' });
        }

        // Check if another case with the same slug exists
        const [[slugCheck]] = await sql.query('SELECT id FROM cases WHERE slug = ? AND id != ?', [slug, id]);
        if (slugCheck) {
            return res.status(400).json({ error: 'SLUG_ALREADY_EXISTS' });
        }

        // Update the case
        await sql.query(
            'UPDATE cases SET name = ?, slug = ?, img = ? WHERE id = ?',
            [name, slug, img, id]
        );

        sendLog('admin', `[${req.user.id}] ${req.user.username} updated case: ${name}`);
        
        // Refresh case cache
        await cacheCases();
        
        res.json({
            id: parseInt(id),
            name,
            slug,
            img
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Delete a case
router.delete('/:id', async (req, res) => {
    try {
        // Check if case exists
        const [[existingCase]] = await sql.query('SELECT name FROM cases WHERE id = ?', [req.params.id]);
        if (!existingCase) {
            return res.status(404).json({ error: 'CASE_NOT_FOUND' });
        }

        // Check if case has any openings
        const [[openingsCount]] = await sql.query(`
            SELECT COUNT(*) as count FROM caseOpenings co
            JOIN caseVersions cv ON co.caseVersionId = cv.id
            WHERE cv.caseId = ?
        `, [req.params.id]);

        if (openingsCount.count > 0) {
            return res.status(400).json({ error: 'CASE_HAS_OPENINGS' });
        }

        // Delete the case (this will cascade to delete versions and items)
        await sql.query('DELETE FROM cases WHERE id = ?', [req.params.id]);

        sendLog('admin', `[${req.user.id}] ${req.user.username} deleted case: ${existingCase.name}`);
        
        // Refresh case cache
        await cacheCases();
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Create a new case version
router.post('/:id/versions', async (req, res) => {
    console.log('Received version request body:', req.body); // Debug log
    
    const { price, name, isActive = true } = req.body;
    const { id } = req.params;

    // Parse price if it came as a string
    const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: 'INVALID_PRICE', details: { price, parsedPrice } });
    }
    
    // If name is not provided, fetch it from the case
    let versionName = name;

    try {
        await doTransaction(async (connection, commit) => {
            // Check if case exists
            const [[existingCase]] = await connection.query('SELECT name FROM cases WHERE id = ?', [id]);
            if (!existingCase) {
                return res.status(404).json({ error: 'CASE_NOT_FOUND' });
            }
            
            // If name not provided in request, use the case name
            if (!versionName) {
                versionName = existingCase.name;
            }

            // If this version should be active and no other versions should be active at the same time,
            // end any currently active versions
            if (isActive) {
                await connection.query(`
                    UPDATE caseVersions SET endedAt = CURRENT_TIMESTAMP
                    WHERE caseId = ? AND endedAt IS NULL
                `, [id]);
            }

            // Create new version with parsed price and name
            // If it's active, endedAt is NULL, otherwise set it to current timestamp
            const endedAt = isActive ? null : 'CURRENT_TIMESTAMP';
            const [result] = await connection.query(
                'INSERT INTO caseVersions (caseId, price, name, endedAt) VALUES (?, ?, ?, ' + (isActive ? 'NULL' : 'CURRENT_TIMESTAMP') + ')',
                [id, parsedPrice, versionName]
            );

            await commit();

            sendLog('admin', `[${req.user.id}] ${req.user.username} created a new version for case: ${existingCase.name}`);
            
            // Refresh case cache
            await cacheCases();
            
            res.status(201).json({
                id: result.insertId,
                caseId: parseInt(id),
                price,
                createdAt: new Date(),
                endedAt: null,
                isActive: true,
                items: []
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Update a case version (name, price, active status)
router.put('/versions/:versionId', async (req, res) => {
    console.log('Received version update request:', req.body); // Debug log
    
    const { name, price, isActive } = req.body;
    const { versionId } = req.params;

    // Validate fields
    if (!name && price === undefined && isActive === undefined) {
        return res.status(400).json({ error: 'NOTHING_TO_UPDATE' });
    }

    // Parse price if it was provided and is a string
    let parsedPrice = null;
    if (price !== undefined) {
        parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ error: 'INVALID_PRICE' });
        }
    }

    try {
        await doTransaction(async (connection, commit) => {
            // Check if version exists
            const [[version]] = await connection.query(
                'SELECT v.id, v.name, v.price, v.endedAt, v.caseId, c.name AS caseName FROM caseVersions v JOIN cases c ON v.caseId = c.id WHERE v.id = ?',
                [versionId]
            );

            if (!version) {
                return res.status(404).json({ error: 'VERSION_NOT_FOUND' });
            }

            let updates = [];
            let params = [];

            // Add fields to update
            if (name) {
                updates.push('name = ?');
                params.push(name);
            }

            if (parsedPrice !== null) {
                updates.push('price = ?');
                params.push(parsedPrice);
            }

            // Handle active status
            if (isActive !== undefined) {
                if (isActive) {
                    // Only if we're activating this version, deactivate others
                    if (version.endedAt !== null) {
                        updates.push('endedAt = NULL');

                        // Deactivate other versions for this case
                        await connection.query(
                            'UPDATE caseVersions SET endedAt = CURRENT_TIMESTAMP WHERE caseId = ? AND id != ? AND endedAt IS NULL',
                            [version.caseId, versionId]
                        );
                    }
                } else if (!isActive && version.endedAt === null) {
                    // Only if we're deactivating an active version
                    updates.push('endedAt = CURRENT_TIMESTAMP');
                }
            }

            // Only update if there are fields to update
            if (updates.length > 0) {
                // Add version ID to params
                params.push(versionId);

                await connection.query(
                    `UPDATE caseVersions SET ${updates.join(', ')} WHERE id = ?`,
                    params
                );

                await commit();

                // Log the update
                sendLog('admin', `[${req.user.id}] ${req.user.username} updated version for case: ${version.caseName}`);
                
                // Refresh case cache
                await cacheCases();
                
                // Get updated version to return
                const [[updatedVersion]] = await sql.query(
                    'SELECT id, name, price, createdAt, endedAt, caseId FROM caseVersions WHERE id = ?',
                    [versionId]
                );
                
                // Add isActive flag
                updatedVersion.isActive = updatedVersion.endedAt === null;
                
                res.json(updatedVersion);
            } else {
                res.json({
                    id: parseInt(versionId),
                    name: version.name,
                    price: version.price,
                    createdAt: version.createdAt,
                    endedAt: version.endedAt,
                    isActive: version.endedAt === null,
                    caseId: version.caseId
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Add an item to a case version
router.post('/versions/:versionId/items', async (req, res) => {
    console.log('Received request body:', req.body); // Debug log
    
    const { robloxId, name, img, price, probability } = req.body;
    const { versionId } = req.params;

    // Parse numeric values if they came as strings
    const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
    const parsedProbability = typeof probability === 'string' ? parseFloat(probability) : probability;

    if (!name || !img || isNaN(parsedPrice) || parsedPrice < 0 || isNaN(parsedProbability) || parsedProbability <= 0 || parsedProbability > 100) {
        return res.status(400).json({ error: 'INVALID_FIELDS', details: { name, img, price: parsedPrice, probability: parsedProbability } });
    }

    try {
        await doTransaction(async (connection, commit) => {
            // Check if version exists and is active
            const [[version]] = await connection.query(`
                SELECT cv.id, c.name as caseName 
                FROM caseVersions cv
                JOIN cases c ON cv.caseId = c.id 
                WHERE cv.id = ? AND cv.endedAt IS NULL
            `, [versionId]);

            if (!version) {
                return res.status(404).json({ error: 'VERSION_NOT_FOUND_OR_INACTIVE' });
            }

            // Get current items to calculate probability range
            const [items] = await connection.query(`
                SELECT rangeFrom, rangeTo FROM caseItems WHERE caseVersionId = ?
                ORDER BY rangeFrom
            `, [versionId]);

            // Calculate total range size and remaining probability
            const totalProbability = 100000; // 100% with 3 decimal places precision
            let usedRange = 0;

            for (const item of items) {
                usedRange += (item.rangeTo - item.rangeFrom + 1);
            }

            const remainingRange = totalProbability - usedRange;
            const requestedRange = Math.round((probability / 100) * totalProbability);

            if (requestedRange > remainingRange) {
                return res.status(400).json({ 
                    error: 'INSUFFICIENT_PROBABILITY',
                    remaining: parseFloat((remainingRange / totalProbability * 100).toFixed(3))
                });
            }

            // Calculate new range
            let rangeFrom = 1;
            if (items.length > 0) {
                rangeFrom = items[items.length - 1].rangeTo + 1;
            }
            const rangeTo = rangeFrom + requestedRange - 1;

            // Insert the item with parsed values
            const [result] = await connection.query(`
                INSERT INTO caseItems (caseVersionId, robloxId, name, img, price, rangeFrom, rangeTo)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [versionId, robloxId || null, name, img, parsedPrice, rangeFrom, rangeTo]);

            await commit();

            sendLog('admin', `[${req.user.id}] ${req.user.username} added item ${name} to case: ${version.caseName}`);
            
            // Refresh case cache
            await cacheCases();
            
            res.status(201).json({
                id: result.insertId,
                caseVersionId: parseInt(versionId),
                robloxId,
                name,
                img,
                price,
                rangeFrom,
                rangeTo,
                probability: parseFloat((requestedRange / totalProbability * 100).toFixed(3))
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Update an item
router.put('/items/:itemId', async (req, res) => {
    const { robloxId, name, img, price, probability } = req.body;
    const { itemId } = req.params;

    if (!name || !img || typeof price !== 'number' || price < 0 || typeof probability !== 'number' || probability <= 0 || probability > 100) {
        return res.status(400).json({ error: 'INVALID_FIELDS' });
    }

    try {
        await doTransaction(async (connection, commit) => {
            // Check if item exists
            const [[item]] = await connection.query(`
                SELECT ci.*, cv.endedAt, c.name as caseName 
                FROM caseItems ci
                JOIN caseVersions cv ON ci.caseVersionId = cv.id
                JOIN cases c ON cv.caseId = c.id
                WHERE ci.id = ?
            `, [itemId]);

            if (!item) {
                return res.status(404).json({ error: 'ITEM_NOT_FOUND' });
            }

            if (item.endedAt !== null) {
                return res.status(400).json({ error: 'CANNOT_MODIFY_INACTIVE_VERSION' });
            }

            // Get all items from the version
            const [items] = await connection.query(`
                SELECT id, rangeFrom, rangeTo FROM caseItems WHERE caseVersionId = ?
            `, [item.caseVersionId]);

            // Calculate total range size excluding current item
            const totalProbability = 100000; // 100% with 3 decimal places precision
            let usedRange = 0;

            for (const i of items) {
                if (i.id != itemId) {
                    usedRange += (i.rangeTo - i.rangeFrom + 1);
                }
            }

            const remainingRange = totalProbability - usedRange;
            const requestedRange = Math.round((probability / 100) * totalProbability);

            if (requestedRange > remainingRange) {
                return res.status(400).json({ 
                    error: 'INSUFFICIENT_PROBABILITY',
                    remaining: parseFloat((remainingRange / totalProbability * 100).toFixed(3))
                });
            }

            // Calculate new range - we'll use the same starting point
            const rangeFrom = item.rangeFrom;
            const rangeTo = rangeFrom + requestedRange - 1;

            // Update the item
            await connection.query(`
                UPDATE caseItems 
                SET robloxId = ?, name = ?, img = ?, price = ?, rangeFrom = ?, rangeTo = ?
                WHERE id = ?
            `, [robloxId || null, name, img, price, rangeFrom, rangeTo, itemId]);

            await commit();

            sendLog('admin', `[${req.user.id}] ${req.user.username} updated item ${name} in case: ${item.caseName}`);
            
            // Refresh case cache
            await cacheCases();
            
            res.json({
                id: parseInt(itemId),
                caseVersionId: item.caseVersionId,
                robloxId,
                name,
                img,
                price,
                rangeFrom,
                rangeTo,
                probability: parseFloat((requestedRange / totalProbability * 100).toFixed(3))
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Delete an item
router.delete('/items/:itemId', async (req, res) => {
    try {
        await doTransaction(async (connection, commit) => {
            // Check if item exists
            const [[item]] = await connection.query(`
                SELECT ci.*, cv.endedAt, c.name as caseName 
                FROM caseItems ci
                JOIN caseVersions cv ON ci.caseVersionId = cv.id
                JOIN cases c ON cv.caseId = c.id
                WHERE ci.id = ?
            `, [req.params.itemId]);

            if (!item) {
                return res.status(404).json({ error: 'ITEM_NOT_FOUND' });
            }

            if (item.endedAt !== null) {
                return res.status(400).json({ error: 'CANNOT_MODIFY_INACTIVE_VERSION' });
            }

            // Check if item has been part of any case openings
            const [[openingCount]] = await connection.query(
                'SELECT COUNT(*) as count FROM caseOpenings WHERE caseItemId = ?',
                [req.params.itemId]
            );

            if (openingCount.count > 0) {
                return res.status(400).json({ error: 'ITEM_HAS_OPENINGS' });
            }

            // Delete the item
            await connection.query('DELETE FROM caseItems WHERE id = ?', [req.params.itemId]);

            await commit();

            sendLog('admin', `[${req.user.id}] ${req.user.username} deleted item ${item.name} from case: ${item.caseName}`);
            
            // Refresh case cache
            await cacheCases();
            
            res.json({ success: true });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Normalize probability distribution for all items in a case version
router.post('/versions/:versionId/normalize', async (req, res) => {
    const { versionId } = req.params;

    try {
        await doTransaction(async (connection, commit) => {
            // Check if version exists and is active
            const [[version]] = await connection.query(`
                SELECT cv.id, c.name as caseName 
                FROM caseVersions cv
                JOIN cases c ON cv.caseId = c.id 
                WHERE cv.id = ? AND cv.endedAt IS NULL
            `, [versionId]);

            if (!version) {
                return res.status(404).json({ error: 'VERSION_NOT_FOUND_OR_INACTIVE' });
            }

            // Get all items in the version
            const [items] = await connection.query(
                'SELECT id, price FROM caseItems WHERE caseVersionId = ? ORDER BY price DESC',
                [versionId]
            );

            if (items.length === 0) {
                return res.status(400).json({ error: 'NO_ITEMS_IN_VERSION' });
            }

            const totalProbability = 100000;
            let rangeCursor = 1;

            // Redistribute probabilities based on item prices (inverse relationship)
            // Higher priced items get lower probabilities
            // Calculate total inverse price for weighting
            const totalInversePrice = items.reduce((sum, item) => {
                return sum + (1 / Math.max(1, item.price));
            }, 0);

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const weight = (1 / Math.max(1, item.price)) / totalInversePrice;
                let rangeSize;
                
                if (i === items.length - 1) {
                    // Last item gets all remaining probability to ensure total is exactly 100%
                    rangeSize = totalProbability - rangeCursor + 1;
                } else {
                    rangeSize = Math.round(weight * totalProbability);
                }
                
                const rangeFrom = rangeCursor;
                const rangeTo = rangeCursor + rangeSize - 1;
                
                await connection.query(
                    'UPDATE caseItems SET rangeFrom = ?, rangeTo = ? WHERE id = ?',
                    [rangeFrom, rangeTo, item.id]
                );
                
                rangeCursor = rangeTo + 1;
            }

            await commit();

            sendLog('admin', `[${req.user.id}] ${req.user.username} normalized probabilities for case: ${version.caseName}`);
            
            // Refresh case cache
            await cacheCases();
            
            res.json({ success: true });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Get the remaining probability for a case version
router.get('/versions/:versionId/remaining-probability', async (req, res) => {
    try {
        // Check if version exists and is active
        const [[version]] = await sql.query(`
            SELECT id FROM caseVersions WHERE id = ? AND endedAt IS NULL
        `, [req.params.versionId]);

        if (!version) {
            return res.status(404).json({ error: 'VERSION_NOT_FOUND_OR_INACTIVE' });
        }

        // Get current items to calculate used probability
        const [items] = await sql.query(`
            SELECT rangeFrom, rangeTo FROM caseItems WHERE caseVersionId = ?
        `, [req.params.versionId]);

        // Calculate total range size and remaining probability
        const totalProbability = 100000; // 100% with 3 decimal places precision
        let usedRange = 0;

        for (const item of items) {
            usedRange += (item.rangeTo - item.rangeFrom + 1);
        }

        const remainingRange = totalProbability - usedRange;
        const remainingProbability = parseFloat((remainingRange / totalProbability * 100).toFixed(3));

        res.json({
            versionId: parseInt(req.params.versionId),
            totalProbability: 100,
            usedProbability: parseFloat((usedRange / totalProbability * 100).toFixed(3)),
            remainingProbability
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

module.exports = router;
